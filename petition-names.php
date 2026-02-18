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
