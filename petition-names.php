<?php
/**
 * Plugin Name:       Petition Names
 * Description:       A block to display a list of names from a Gravity Forms petition.
 * Version:           0.2.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            Bethink Studio, George Stephanis
 * Author URI:        https://bethink.studio/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       petition-names
 *
 * @package PetitionNames
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function bethink_petition_names_block_init() {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );

	// Localize REST API settings for frontend script
	wp_localize_script(
		'bethink-petition-names-view-script',
		'wpApiSettings',
		array(
			'root'  => esc_url_raw( rest_url() ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
		)
	);
}
add_action( 'init', 'bethink_petition_names_block_init' );

/**
 * Format a readable display name for an entry.
 *
 * @param array $entry         The Gravity Forms entry.
 * @param int   $name_field_id The field ID for the name field.
 * @return string
 */
function bethink_petition_names_format_entry_name( $entry, $name_field_id ) {
	$name_field_id = absint( $name_field_id );
	$first_name    = rgar( $entry, "{$name_field_id}.3" );
	$last_name     = rgar( $entry, "{$name_field_id}.6" );

	return trim( $first_name . ' ' . $last_name );
}

/**
 * Register REST route for searching entries in a selected form.
 */
function bethink_petition_names_register_rest_routes() {
	// Editor endpoint (requires edit_posts permission)
	register_rest_route(
		'petition-names/v1',
		'/forms/(?P<form_id>\\d+)/entries',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'bethink_petition_names_rest_entries',
			'permission_callback' => static function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// Frontend pagination endpoint (restricted to published blocks)
	register_rest_route(
		'petition-names/v1',
		'/forms/(?P<form_id>\\d+)/entries/page/(?P<page>\\d+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'bethink_petition_names_rest_pagination',
			'permission_callback' => 'bethink_petition_names_validate_public_access',
			'args'                => array(
				'form_id' => array(
					'required' => true,
					'type'     => 'integer',
				),
				'page' => array(
					'required' => true,
					'type'     => 'integer',
					'minimum'  => 1,
				),
				'nameFieldId' => array(
					'required' => true,
					'type'     => 'integer',
				),
				'emailFieldId' => array(
					'required' => false,
					'type'     => 'integer',
				),
				'itemsPerPage' => array(
					'required' => false,
					'type'     => 'integer',
					'minimum'  => 20,
					'maximum'  => 200,
				),
				'pinnedEntryIds' => array(
					'required' => false,
					'type'     => 'array',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'bethink_petition_names_register_rest_routes' );

/**
 * Validate that the requested form/field combination is used in a published petition-names block.
 *
 * @param WP_REST_Request $request REST request.
 * @return bool|WP_Error
 */
function bethink_petition_names_validate_public_access( WP_REST_Request $request ) {
	$form_id = absint( $request['form_id'] );
	$name_field_id = absint( $request->get_param( 'nameFieldId' ) );
	$email_field_id = absint( $request->get_param( 'emailFieldId' ) );

	// Get all published posts that contain petition-names blocks
	$allowed_configs = bethink_petition_names_get_published_block_configs();

	// Check if this configuration is allowed
	foreach ( $allowed_configs as $config ) {
		if (
			(int) $config['formId'] === $form_id &&
			(int) $config['nameFieldId'] === $name_field_id &&
			( empty( $email_field_id ) || (int) $config['emailFieldId'] === $email_field_id )
		) {
			return true;
		}
	}

	return new WP_Error(
		'forbidden_access',
		__( 'Access denied. This form configuration is not publicly available.', 'petition-names' ),
		array( 'status' => 403 )
	);
}

/**
 * Get all form configurations from published petition-names blocks.
 *
 * @return array Array of block configurations.
 */
function bethink_petition_names_get_published_block_configs() {
	static $cached_configs = null;

	// Use caching to avoid repeated database queries
	if ( null !== $cached_configs ) {
		return $cached_configs;
	}

	// Check if we have a cached version in options
	$cached_configs = get_option( 'petition_names_allowed_configs', array() );
	if ( ! empty( $cached_configs ) ) {
		return $cached_configs;
	}

	$cached_configs = array();

	// Get all published posts/pages that might contain blocks
	$posts = get_posts( array(
		'post_type'      => array( 'post', 'page' ),
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		's'              => 'wp:bethink/petition-names', // Search for block name in content
		'fields'         => 'ids',
	) );

	// Convert IDs back to post objects for processing
	if ( ! empty( $posts ) ) {
		$posts = get_posts( array(
			'post_type'      => array( 'post', 'page' ),
			'post_status'    => 'publish',
			'post__in'       => $posts,
			'posts_per_page' => -1,
		) );
	}

	foreach ( $posts as $post ) {
		// Parse blocks in post content
		if ( has_blocks( $post->post_content ) ) {
			$blocks = parse_blocks( $post->post_content );
			$cached_configs = array_merge( $cached_configs, bethink_petition_names_extract_block_configs( $blocks ) );
		}
	}

	// Allow developers to filter the allowed configurations
	$cached_configs = apply_filters( 'petition_names_allowed_configs', $cached_configs );

	// Cache in options for persistence
	update_option( 'petition_names_allowed_configs', $cached_configs, false );

	return $cached_configs;
}

/**
 * Recursively extract petition-names block configurations from parsed blocks.
 *
 * @param array $blocks Parsed blocks array.
 * @return array Array of block configurations.
 */
function bethink_petition_names_extract_block_configs( $blocks ) {
	$configs = array();

	foreach ( $blocks as $block ) {
		// Check if this is a petition-names block
		if ( 'bethink/petition-names' === $block['blockName'] && ! empty( $block['attrs'] ) ) {
			$attrs = $block['attrs'];

			// Only include blocks with required configuration
			if ( ! empty( $attrs['formId'] ) && ! empty( $attrs['nameFieldId'] ) ) {
				$configs[] = array(
					'formId'       => $attrs['formId'],
					'nameFieldId'  => $attrs['nameFieldId'],
					'emailFieldId' => $attrs['emailFieldId'] ?? '',
				);
			}
		}

		// Recursively check inner blocks
		if ( ! empty( $block['innerBlocks'] ) ) {
			$configs = array_merge( $configs, bethink_petition_names_extract_block_configs( $block['innerBlocks'] ) );
		}
	}

	return $configs;
}

/**
 * Return entry search results for the block editor pinning control.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function bethink_petition_names_rest_entries( WP_REST_Request $request ) {
	if ( ! class_exists( 'GFAPI' ) ) {
		return new WP_Error( 'gf_missing', __( 'Gravity Forms is not active.', 'petition-names' ), array( 'status' => 400 ) );
	}

	$form_id       = absint( $request['form_id'] );
	$name_field_id = absint( $request->get_param( 'nameFieldId' ) );
	$email_field_id = absint( $request->get_param( 'emailFieldId' ) );
	$ids_raw       = (string) $request->get_param( 'ids' );
	$limit         = absint( $request->get_param( 'limit' ) );
	$page_size     = $limit > 0 ? min( 60, $limit ) : 30;

	if ( ! empty( $ids_raw ) ) {
		$ids = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', explode( ',', $ids_raw ) )
				)
			)
		);

		$results = array();
		foreach ( $ids as $entry_id ) {
			$entry = GFAPI::get_entry( $entry_id );
			if ( is_wp_error( $entry ) || (int) rgar( $entry, 'form_id' ) !== $form_id || 'active' !== rgar( $entry, 'status' ) ) {
				continue;
			}

			$result = array(
				'id'   => (int) $entry_id,
				'name' => bethink_petition_names_format_entry_name( $entry, $name_field_id ),
			);

			if ( $email_field_id > 0 ) {
				$result['email'] = rgar( $entry, (string) $email_field_id );
			}

			$results[] = $result;
		}

		return rest_ensure_response( $results );
	}

	$search = trim( sanitize_text_field( (string) $request->get_param( 'search' ) ) );

	$search_criteria = array( 'status' => 'active' );
	if ( strlen( $search ) >= 2 && $name_field_id > 0 ) {
		$search_criteria['field_filters'] = array(
			'mode' => 'any',
			array(
				'key'      => "{$name_field_id}.3",
				'operator' => 'contains',
				'value'    => $search,
			),
			array(
				'key'      => "{$name_field_id}.6",
				'operator' => 'contains',
				'value'    => $search,
			),
		);
	}

	$sorting = array( 'key' => 'date_created', 'direction' => 'DESC' );
	$paging  = array( 'offset' => 0, 'page_size' => $page_size );

	$total_count = 0;
	$entries     = GFAPI::get_entries( $form_id, $search_criteria, $sorting, $paging, $total_count );

	if ( is_wp_error( $entries ) ) {
		return new WP_Error( 'gf_entries_error', __( 'Error loading entries.', 'petition-names' ), array( 'status' => 500 ) );
	}

	$results = array();
	foreach ( $entries as $entry ) {
		$entry_id = (int) rgar( $entry, 'id' );
		$result = array(
			'id'   => $entry_id,
			'name' => bethink_petition_names_format_entry_name( $entry, $name_field_id ),
		);

		if ( $email_field_id > 0 ) {
			$result['email'] = rgar( $entry, (string) $email_field_id );
		}

		$results[] = $result;
	}

	return rest_ensure_response( $results );
}

/**
 * Clear cached block configurations when posts are updated.
 */
function bethink_petition_names_clear_config_cache() {
	delete_option( 'petition_names_allowed_configs' );
}
add_action( 'save_post', 'bethink_petition_names_clear_config_cache' );
add_action( 'delete_post', 'bethink_petition_names_clear_config_cache' );

/**
 * Handle frontend pagination requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function bethink_petition_names_rest_pagination( WP_REST_Request $request ) {
	if ( ! class_exists( 'GFAPI' ) ) {
		return new WP_Error( 'gf_missing', __( 'Gravity Forms is not active.', 'petition-names' ), array( 'status' => 400 ) );
	}

	$form_id = absint( $request['form_id'] );
	$page = absint( $request['page'] );
	$name_field_id = absint( $request->get_param( 'nameFieldId' ) );
	$email_field_id = absint( $request->get_param( 'emailFieldId' ) );
	$items_per_page = absint( $request->get_param( 'itemsPerPage' ) ) ?: 60;
	$pinned_entry_ids = (array) $request->get_param( 'pinnedEntryIds' );

	// Validate parameters
	if ( $form_id <= 0 || $page <= 0 || $name_field_id <= 0 ) {
		return new WP_Error( 'invalid_params', __( 'Invalid parameters provided.', 'petition-names' ), array( 'status' => 400 ) );
	}

	// Sanitize pinned entry IDs
	$pinned_entry_ids = array_values(
		array_unique(
			array_filter(
				array_map( 'absint', $pinned_entry_ids )
			)
		)
	);

	$items_per_page = max( 20, min( 200, $items_per_page ) );
	$offset = ( $page - 1 ) * $items_per_page;

	// Build search criteria (exclude pinned entries from pagination)
	$search_criteria = array( 'status' => 'active' );
	if ( ! empty( $pinned_entry_ids ) ) {
		$search_criteria['field_filters'] = array(
			array(
				'key'      => 'id',
				'operator' => 'not in',
				'value'    => $pinned_entry_ids,
			),
		);
	}

	$sorting = array( 'key' => 'date_created', 'direction' => 'DESC' );
	$paging = array( 'offset' => $offset, 'page_size' => $items_per_page );

	$total_count = 0;
	$entries = GFAPI::get_entries( $form_id, $search_criteria, $sorting, $paging, $total_count );

	if ( is_wp_error( $entries ) ) {
		return new WP_Error( 'gf_entries_error', __( 'Error loading entries.', 'petition-names' ), array( 'status' => 500 ) );
	}

	$results = array();

	// If this is page 1, add pinned entries first
	if ( 1 === $page && ! empty( $pinned_entry_ids ) ) {
		foreach ( $pinned_entry_ids as $pinned_entry_id ) {
			$pinned_entry = GFAPI::get_entry( $pinned_entry_id );
			if (
				is_wp_error( $pinned_entry ) ||
				(int) rgar( $pinned_entry, 'form_id' ) !== $form_id ||
				'active' !== rgar( $pinned_entry, 'status' )
			) {
				continue;
			}

			$result = array(
				'id'   => (int) $pinned_entry_id,
				'name' => bethink_petition_names_format_entry_name( $pinned_entry, $name_field_id ),
			);

			if ( $email_field_id > 0 ) {
				$email = rgar( $pinned_entry, (string) $email_field_id );
				if ( ! empty( $email ) ) {
					$result['email'] = $email;
					$result['gravatar_hash'] = md5( strtolower( trim( $email ) ) );
				}
			}

			$results[] = $result;
		}
	}

	// Add regular entries
	foreach ( $entries as $entry ) {
		$entry_id = (int) rgar( $entry, 'id' );

		// Skip if this entry is already included as a pinned entry
		$existing_ids = array_column( $results, 'id' );
		if ( in_array( $entry_id, $existing_ids, true ) ) {
			continue;
		}

		$result = array(
			'id'   => $entry_id,
			'name' => bethink_petition_names_format_entry_name( $entry, $name_field_id ),
		);

		if ( $email_field_id > 0 ) {
			$email = rgar( $entry, (string) $email_field_id );
			if ( ! empty( $email ) ) {
				$result['email'] = $email;
				$result['gravatar_hash'] = md5( strtolower( trim( $email ) ) );
			}
		}

		$results[] = $result;
	}

	$total_pages = ceil( $total_count / $items_per_page );

	return rest_ensure_response( array(
		'entries' => $results,
		'pagination' => array(
			'current_page' => $page,
			'total_pages' => $total_pages,
			'total_count' => $total_count,
			'items_per_page' => $items_per_page,
		),
	) );
}
