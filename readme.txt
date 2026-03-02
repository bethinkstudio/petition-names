=== Petition Names ===
Contributors:      Bethink Studio, georgestephanis
Tags:              block, petition, gravity forms, names, signatures, gravatars, pagination
Tested up to:      6.8
Stable tag:        0.3.3
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Display a beautiful, paginated list of petition signatories from Gravity Forms with customizable layout and gravatar support.

== Description ==

Petition Names is a WordPress block that creates an elegant, responsive display of petition signatories from Gravity Forms submissions. Perfect for showing public support on petition campaigns, open letters, and community initiatives.

**Key Features:**

* **Seamless Gravity Forms Integration** - Connect directly to any Gravity Forms form and select name and email fields
* **Responsive Multi-Column Layout** - Automatic column layout that adapts to screen size with customizable column widths
* **Gravatar Profile Pictures** - Display signatory profile pictures using Gravatar service (optional)
* **Flexible Pagination** - Configurable items per page (3-200 entries) with clean pagination controls
* **Pinned Entries** - Highlight important signatories by pinning them to the top of the list
* **Smooth Animations** - Elegant slide-up and fade-in animations for visual appeal
* **Easy Block Configuration** - Intuitive settings in the WordPress Block Editor sidebar

**Perfect For:**

* Online petitions and campaigns
* Open letters and statements
* Community initiatives
* Event supporter lists
* Endorsement displays

**Requirements:**

* Gravity Forms plugin (active with REST API enabled)
* WordPress 6.0 or higher
* PHP 7.4 or higher

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/petition-names` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Ensure Gravity Forms is installed and activated with REST API enabled
4. Add the "Petition Names" block to any post or page using the WordPress Block Editor

== Frequently Asked Questions ==

= Do I need Gravity Forms for this plugin to work? =

Yes, this plugin requires Gravity Forms to be installed and activated. It connects to Gravity Forms entries via the REST API to display petition signatories.

= Can I customize how many names are displayed per page? =

Absolutely! You can set anywhere from 3 to 200 names per page in increments of 5. The default is 60 names per page.

= How do I enable profile pictures for signatories? =

Enable the "Show profile pictures" toggle in the block settings, then select an email field from your form. The plugin will automatically display Gravatar images for email addresses that have them.

= Can I highlight certain signatories? =

Yes! Use the "Pinned submissions" feature to search for and pin specific entries to the top of your list. Great for highlighting notable supporters or organizers.

= How do I adjust the column layout? =

You can customize the column width (50-400px) in the Display Settings. The number of columns automatically adjusts based on available space and your chosen width.

= Will this work with any Gravity Forms field types? =

The plugin works with Name fields and Text fields for displaying names, and Email fields for Gravatar integration. It's designed to work with standard petition form setups.

== Screenshots ==

1. **Block Settings** - Easy configuration in the WordPress Block Editor sidebar
2. **Multi-Column Display** - Responsive layout automatically adjusts to screen size
3. **Gravatar Integration** - Profile pictures add personality to your petition display
4. **Pagination Controls** - Clean, accessible pagination for large lists
5. **Pinned Entries** - Highlight important signatories at the top of your list

== Changelog ==

= 0.3.3 =
* Added a new block setting to enable or disable signatory display animations
* Added a server-rendered no-animation mode so animation preference is respected on the frontend
* Enhanced editor UX by consolidating key controls in sidebar panels (Data source, Display Settings, Pinned submissions)
* Improved editor preview behavior for pinned signatories and replaced the pinned indicator with an emoji marker (`📌`) for compatibility
* Refreshed build artifacts for updated block settings and rendering behavior

= 0.3.2 =
* Added Jetpack/Gravatar hovercard re-initialization after asynchronous pagination updates
* Updated gravatar image markup to use standard avatar classes for better hovercard compatibility
* Improved asynchronous pagination handling with clearer inline error feedback during failed page loads
* Refreshed build assets to include latest frontend pagination and hovercard integration changes

= 0.3.1 =
* Fixed REST pagination for preview, draft, and private content when viewed by logged-in editors
* Improved pagination request compatibility by handling pinned entry IDs as array query params and robust server-side parsing
* Replaced pagination alert popups with inline, contextual error messaging for 403 and 400 failures
* Updated editor-side items-per-page minimum to 3 for consistency with frontend and REST validation
* Refreshed build assets after frontend pagination error handling updates

= 0.3.0 =
* Hardened public REST pagination endpoint access to only published block configurations
* Removed raw email addresses from public pagination responses; returns gravatar hash only
* Fixed pinned-entry pagination behavior so pinned entries are inclusive of per-page limits
* Fixed offset handling so displaced entries are not skipped on subsequent pages
* Updated editor preview to account for pinned entries within configured items per page
* Added persistent option-based cache for published block configs with cache invalidation on post save/delete
* Added WordPress Coding Standards tooling (`composer.json`, `phpcs.xml.dist`) with npm integration
* Resolved WPCS violations across plugin PHP files

= 0.2.0 =
* Added configurable items per page (20-200 entries, increments of 5)
* Added adjustable column width control (50-400px, increments of 5)
* Added Gravatar profile picture support with email field selection
* Added pinned entries functionality with search and management
* Added smooth slide-up and fade-in animations
* Enhanced editor preview to match front-end appearance
* Improved responsive multi-column layout
* Added pagination preview in block editor
* Improved block configuration user interface
* Enhanced accessibility and keyboard navigation

= 0.1.0 =
* Initial release
* Basic petition names display from Gravity Forms
* Simple pagination functionality
* WordPress Block Editor integration

== Upgrade Notice ==

= 0.3.3 =
Feature update adding an animation on/off toggle and improving editor-side preview and settings workflow.

= 0.3.2 =
Compatibility update improving Jetpack Gravatar hovercards for asynchronously loaded entries and refining pagination error handling.

= 0.3.1 =
Maintenance release focused on pagination reliability in preview/private contexts and clearer frontend REST error handling.

= 0.3.0 =
Security and quality update: tightens REST data exposure controls, improves pinned-pagination correctness, and adds WPCS-based linting/formatting workflows.

= 0.2.0 =
Major feature release! New gravatar support, configurable display options, pinned entries, animations, and much more. Backup your site before upgrading.

