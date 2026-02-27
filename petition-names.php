<?php
/**
 * Plugin Name:       Petition Names
 * Description:       A block to display a list of names from a Gravity Forms petition.
 * Version:           0.1.0
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
}
add_action( 'rest_api_init', 'bethink_petition_names_register_rest_routes' );

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

			$results[] = array(
				'id'   => (int) $entry_id,
				'name' => bethink_petition_names_format_entry_name( $entry, $name_field_id ),
			);
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
		$results[] = array(
			'id'   => $entry_id,
			'name' => bethink_petition_names_format_entry_name( $entry, $name_field_id ),
		);
	}

	return rest_ensure_response( $results );
}
