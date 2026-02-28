<?php
/**
 * Server-side rendering for the Petition Names block.
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

$form_id = absint( $attributes['formId'] );
$name_field_id = absint( $attributes['nameFieldId'] );
$email_field_id = isset( $attributes['showGravatars'] ) && $attributes['showGravatars'] ? absint( $attributes['emailFieldId'] ) : 0;
$column_width = isset( $attributes['columnWidth'] ) ? max( 50, min( 400, absint( $attributes['columnWidth'] ) ) ) : 125;
$pinned_entry_ids = array_values(
    array_unique(
        array_filter(
            array_map( 'absint', (array) ( $attributes['pinnedEntryIds'] ?? array() ) )
        )
    )
);
$page = isset( $_GET['pn_page'] ) ? max( 1, intval( $_GET['pn_page'] ) ) : 1;
$per_page = isset( $attributes['itemsPerPage'] ) ? max( 20, min( 200, absint( $attributes['itemsPerPage'] ) ) ) : 60;
$offset = ( $page - 1 ) * $per_page;

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
$paging = array( 'offset' => $offset, 'page_size' => $per_page );

$total_count = 0;
$entries = GFAPI::get_entries( $form_id, $search_criteria, $sorting, $paging, $total_count );

if ( is_wp_error( $entries ) ) {
    echo '<div>' . esc_html__( 'Error loading entries.', 'petition-names' ) . '</div>';
    return;
}

echo '<div class="petition-names-list" style="--petition-names-column-width: ' . esc_attr( $column_width ) . 'px;"><ul>';

$rendered_entry_ids = array();

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

        $pinned_name = function_exists( 'bethink_petition_names_format_entry_name' )
            ? bethink_petition_names_format_entry_name( $pinned_entry, $name_field_id )
            : trim( rgar( $pinned_entry, "{$name_field_id}.3" ) . ' ' . rgar( $pinned_entry, "{$name_field_id}.6" ) );

        echo '<li>' . esc_html( $pinned_name ) . '</li>';
        $rendered_entry_ids[] = (int) $pinned_entry_id;
    }
}

foreach ( $entries as $entry ) {
    $entry_id = (int) rgar( $entry, 'id' );
    if ( in_array( $entry_id, $rendered_entry_ids, true ) ) {
        continue;
    }

    $display_name = function_exists( 'bethink_petition_names_format_entry_name' )
        ? bethink_petition_names_format_entry_name( $entry, $name_field_id )
        : trim( rgar( $entry, "{$name_field_id}.3" ) . ' ' . rgar( $entry, "{$name_field_id}.6" ) );

    echo '<li>' . esc_html( $display_name ) . '</li>';
}
echo '</ul>';

$total_pages = ceil( $total_count / $per_page );
if ( 1 < $total_pages ) {
    echo '<div class="petition-names-pagination">';
    for ( $i = 1; $i <= $total_pages; $i++ ) {
        if ( $i === $page ) {
            echo '<span class="current">' . esc_html( $i ) . '</span> ';
        } else {
            echo '<a href="' . esc_url( add_query_arg( 'pn_page', $i ) ) . '">' . esc_html( $i ) . '</a> ';
        }
    }
    echo '</div>'; // .petition-names-pagination
}
echo '</div>'; // .petition-names-list

echo '</div>'; // .wp-block-petition-names