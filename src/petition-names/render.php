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
$page = isset( $_GET['pn_page'] ) ? max( 1, intval( $_GET['pn_page'] ) ) : 1;
$per_page = 20;
$offset = ( $page - 1 ) * $per_page;

$search_criteria = array( 'status' => 'active' );
$sorting = array( 'key' => 'date_created', 'direction' => 'DESC' );
$paging = array( 'offset' => $offset, 'page_size' => $per_page );

$total_count = 0;
$entries = GFAPI::get_entries( $form_id, $search_criteria, $sorting, $paging, $total_count );

if ( is_wp_error( $entries ) ) {
    echo '<div>' . esc_html__( 'Error loading entries.', 'petition-names' ) . '</div>';
    return;
}

echo '<div class="petition-names-list"><ul>';

foreach ( $entries as $entry ) {
    $first = rgar( $entry, "{$name_field_id}.3" );
    $last = rgar( $entry, "{$name_field_id}.6" );
    $last_initial = $last ? strtoupper( mb_substr( $last, 0, 1 ) ) . '.' : '';

    echo '<li>' . esc_html( trim( $first . ' ' . $last_initial ) ) . '</li>';
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