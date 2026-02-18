<?php
// This file is generated. Do not modify it manually.
return array(
	'petition-names' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'bethink/petition-names',
		'version' => '0.1.0',
		'title' => 'Petition Names',
		'category' => 'widgets',
		'icon' => 'groups',
		'description' => 'A block to display a list of names from a Gravity Forms petition.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'petition-names',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'attributes' => array(
			'formId' => array(
				'type' => 'string',
				'default' => ''
			),
			'nameFieldId' => array(
				'type' => 'string',
				'default' => ''
			)
		)
	)
);
