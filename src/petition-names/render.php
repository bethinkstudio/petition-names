<?php
/**
 * Server-side rendering for the Petition Names block.
 *
 * @package PetitionNames
 */

echo '<div ' . wp_kses_data( get_block_wrapper_attributes() ) . '>';

if ( empty( $attributes['formId'] ) || empty( $attributes['nameFieldId'] ) ) {
	echo '<div>' . esc_html__( 'Please select a form and name field in the block settings.', 'petition-names' ) . '</div>';
	return;
}

if ( ! class_exists( 'GFAPI' ) ) {
	echo '<div>' . esc_html__( 'Gravity Forms is not active.', 'petition-names' ) . '</div>';
	return;
}

$form_id          = absint( $attributes['formId'] );
$name_field_id    = absint( $attributes['nameFieldId'] );
$show_animations  = ! isset( $attributes['showAnimations'] ) || ! empty( $attributes['showAnimations'] );
$email_field_id   = isset( $attributes['showGravatars'] ) && $attributes['showGravatars'] ? absint( $attributes['emailFieldId'] ) : 0;
$sort_by          = isset( $attributes['sortBy'] ) ? sanitize_key( (string) $attributes['sortBy'] ) : 'received';
$sort_ascending   = isset( $attributes['sortAscending'] ) ? rest_sanitize_boolean( $attributes['sortAscending'] ) : true;
$column_width     = isset( $attributes['columnWidth'] ) ? max( 50, min( 400, absint( $attributes['columnWidth'] ) ) ) : 125;
$pinned_entry_ids = array_values(
	array_unique(
		array_filter(
			array_map( 'absint', (array) ( $attributes['pinnedEntryIds'] ?? array() ) )
		)
	)
);
$current_page     = 1; // Always start with page 1 for initial load.
$items_per_page   = isset( $attributes['itemsPerPage'] ) ? max( 20, min( 200, absint( $attributes['itemsPerPage'] ) ) ) : 60;
$offset           = 0; // Always start with offset 0.

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
$sorting = function_exists( 'bethink_petition_names_get_sorting_args' )
	? bethink_petition_names_get_sorting_args( $sort_by, $sort_ascending, $name_field_id )
	: array(
		'key'       => 'date_created',
		'direction' => $sort_ascending ? 'ASC' : 'DESC',
	);
$paging  = array(
	'offset'    => $offset,
	'page_size' => $items_per_page,
);

$total_count = 0;
$entries     = GFAPI::get_entries( $form_id, $search_criteria, $sorting, $paging, $total_count );

if ( is_wp_error( $entries ) ) {
	echo '<div>' . esc_html__( 'Error loading entries.', 'petition-names' ) . '</div>';
	return;
}

echo '<div class="petition-names-list' . ( $show_animations ? '' : ' no-animations' ) . '"
	style="--petition-names-column-width: ' . esc_attr( $column_width ) . 'px;"
	data-form-id="' . esc_attr( $form_id ) . '"
	data-name-field-id="' . esc_attr( $name_field_id ) . '"
	data-email-field-id="' . esc_attr( $email_field_id ) . '"
	data-sort-by="' . esc_attr( $sort_by ) . '"
	data-sort-ascending="' . esc_attr( $sort_ascending ? '1' : '0' ) . '"
	data-items-per-page="' . esc_attr( $items_per_page ) . '"
	data-pinned-entries="' . esc_attr( wp_json_encode( $pinned_entry_ids ) ) . '"
><ul class="petition-names-entries">';

$rendered_entry_ids = array();
$entries_rendered   = 0;

if ( 1 === $current_page && ! empty( $pinned_entry_ids ) ) {
	foreach ( $pinned_entry_ids as $pinned_entry_id ) {
		if ( $entries_rendered >= $items_per_page ) {
			break; // Don't exceed page limit.
		}

		$pinned_entry = GFAPI::get_entry( $pinned_entry_id );
		if (
			is_wp_error( $pinned_entry ) ||
			(int) rgar( $pinned_entry, 'form_id' ) !== $form_id ||
			'active' !== rgar( $pinned_entry, 'status' )
		) {
			continue;
		}

		$pinned_name = function_exists( 'bethink_petition_names_format_entry_name' )
			? bethink_petition_names_format_entry_name( $pinned_entry, $name_field_id )
			: trim( rgar( $pinned_entry, "{$name_field_id}.3" ) . ' ' . rgar( $pinned_entry, "{$name_field_id}.6" ) );

		$gravatar_html = '';
		if ( $email_field_id > 0 ) {
			$email = rgar( $pinned_entry, (string) $email_field_id );
			if ( ! empty( $email ) ) {
				$gravatar_hash = md5( strtolower( trim( $email ) ) );
				$gravatar_html = '<img src="https://www.gravatar.com/avatar/' . esc_attr( $gravatar_hash ) . '?s=32&amp;d=mp" alt="" class="avatar avatar-32 photo petition-names-gravatar" /> ';
			}
		}

		echo '<li>' . wp_kses_post( $gravatar_html ) . esc_html( $pinned_name ) . '</li>';
		$rendered_entry_ids[] = (int) $pinned_entry_id;
		++$entries_rendered;
	}
}

foreach ( $entries as $entry ) {
	if ( $entries_rendered >= $items_per_page ) {
		break; // Don't exceed page limit.
	}

	$entry_id = (int) rgar( $entry, 'id' );
	if ( in_array( $entry_id, $rendered_entry_ids, true ) ) {
		continue;
	}

	$display_name = function_exists( 'bethink_petition_names_format_entry_name' )
		? bethink_petition_names_format_entry_name( $entry, $name_field_id )
		: trim( rgar( $entry, "{$name_field_id}.3" ) . ' ' . rgar( $entry, "{$name_field_id}.6" ) );

	$gravatar_html = '';
	if ( $email_field_id > 0 ) {
		$email = rgar( $entry, (string) $email_field_id );
		if ( ! empty( $email ) ) {
			$gravatar_hash = md5( strtolower( trim( $email ) ) );
			$gravatar_html = '<img src="https://www.gravatar.com/avatar/' . esc_attr( $gravatar_hash ) . '?s=32&amp;d=mp" alt="" class="avatar avatar-32 photo petition-names-gravatar" /> ';
		}
	}

	echo '<li>' . wp_kses_post( $gravatar_html ) . esc_html( $display_name ) . '</li>';
	++$entries_rendered;
}
echo '</ul>';

// Loading indicator for async pagination.
echo '<div class="petition-names-loading" style="display: none; text-align: center; padding: 1em;">';
echo '<span>' . esc_html__( 'Loading...', 'petition-names' ) . '</span>';
echo '</div>';

$total_pages = ceil( $total_count / $items_per_page );
if ( 1 < $total_pages ) {
	echo '<div class="petition-names-pagination" data-current-page="1" data-total-pages="' . esc_attr( $total_pages ) . '">';
	for ( $i = 1; $i <= $total_pages; $i++ ) {
		if ( 1 === $i ) {
			echo '<button class="petition-page-btn current" data-page="' . esc_attr( $i ) . '" disabled>' . esc_html( $i ) . '</button> ';
		} else {
			echo '<button class="petition-page-btn" data-page="' . esc_attr( $i ) . '">' . esc_html( $i ) . '</button> ';
		}
	}
	echo '</div>'; // .petition-names-pagination.
}
echo '</div>'; // .petition-names-list.

echo '</div>'; // .wp-block-petition-names.
