# Changelog

All notable changes to this project will be documented in this file.

## [8.0.4] - 2024-09-26

### Changed
- Updated translations.js to use lowercase keys for prayer names
- Modified extension.js to handle lowercase prayer name keys
- Updated _getTranslation() method in extension.js to convert keys to lowercase

### Improved
- Consistency in prayer name key usage across the extension
- Code readability and maintainability

## [8.0.3] - 2024-09-26

### Fixed
- Issue with prayer names not updating when language changes
- Modified _createMenu() method in extension.js to use translated prayer names
- Updated _getNextPrayer() method to return both original and translated prayer names
- Adjusted _updateTimer() method to display translated prayer names in the panel

### Improved
- Overall consistency of language handling throughout the extension
- User experience with more accurate language representation

## [8.0.2] - 2024-09-24

### Fixed
- Updated import statement in extension.js for Extension class and gettext function
- Changed import path to 'resource:///org/gnome/shell/extensions/extension.js' in extension.js

### Improved
- Consistency between prefs.js and extension.js import statements
- Further enhanced compatibility with the latest GNOME Shell versions

## [8.0.1] - 2024-09-24

### Fixed
- Resolved ImportError in prefs.js by updating it to follow the recommended approach from GNOME Shell extension documentation
- Fixed import statement in extension.js to use the correct path for Extension class and gettext function

### Changed
- Updated prefs.js to export a fillPreferencesWindow function instead of extending ExtensionPreferences class
- Modified import statements in prefs.js and extension.js to use correct resource paths
- Updated getSettings() call to use ExtensionUtils.getSettings()

### Improved
- Compatibility with the latest GNOME Shell versions
- Adherence to current best practices for GNOME Shell extension development

## [8.0.0] - 2024-09-27

### Changed
- Updated extension structure to be fully compatible with GNOME Shell 45 and 46
- Refactored `prefs.js` to use the new `ExtensionPreferences` class
- Updated `extension.js` to use the latest GNOME Shell extension APIs
- Modified `metadata.json` to reflect the new version and compatibility

### Improved
- Resolved issues with loading `extensionUtils.js`
- Enhanced overall extension stability and performance
- Improved adherence to the latest GNOME Shell extension development best practices

## [5.2.0] - 2024-09-24

### Added
- Gear icon button at the bottom of the dropdown menu for quick access to settings
- Dropdown menu displaying all prayer times for the day
- New translations for "Settings" in all supported languages

### Changed
- Modified extension.js to include a PopupMenu for displaying all prayer times
- Added _createMenu method to populate the menu with prayer times
- Updated _updateTimer method to refresh the menu items along with the panel label
- Added _addSettingsButton method to create and add the settings button to the menu
- Updated translations.js to include "Settings" translations for all supported languages
- Updated prefs.js to use ES module imports for improved compatibility with newer GNOME Shell versions

### Improved
- User experience by providing easy access to all prayer times of the day
- Accessibility to extension settings directly from the dropdown menu
- Compatibility with newer versions of GNOME Shell in preferences window

## [5.1.0] - 2024-09-26

### Added
- Support for Amazigh language in two scripts: Tifinagh and Arabic
- New language options in preferences for Amazigh (Tifinagh) and Amazigh (Arabic script)

### Changed
- Updated translations.js to include separate entries for Amazigh in Tifinagh script (ber_tfng) and Arabic script (ber_arab)
- Modified prefs.js to include new language options in the dropdown menu
- Updated README.md to reflect the new language options

### Improved
- Language support for Amazigh-speaking users, providing options for both Tifinagh and Arabic scripts

## [5.0.0] - 2024-09-25

### Added
- Multi-language support for 17 languages: Arabic, English, French, Turkish, Malay, Urdu, Persian, Bosnian, Amazigh, Swahili, Spanish, Italian, German, Russian, Chinese, Indonesian, and Hindi
- New language selection option in preferences
- Translations file (translations.js) containing prayer names and "Next Prayer" text in all supported languages

### Changed
- Updated extension.js to use the selected language for displaying prayer names and "Next Prayer" text
- Modified prefs.js to include a dropdown for language selection
- Updated schemas/org.gnome.shell.extensions.burawi-ba-salat.gschema.xml to include a new 'language' key

### Improved
- User experience by allowing prayer times to be displayed in the user's preferred language
- Accessibility for users from various linguistic backgrounds

## [4.1.0] - 2024-09-24

### Changed
- Restored full implementation of PrayTimes class in praytimes.js, including all previously omitted methods
- Updated extension.js to utilize the complete PrayTimes implementation
- Improved Indicator class in extension.js to use settings for latitude, longitude, and calculation method
- Added settings change listener to update prayer times when user modifies settings
- Refactored _updateTimer method to use current settings for location

### Improved
- Enhanced error handling and cleanup in the Indicator class
- Full functionality of prayer times calculation
- Extension's responsiveness to user settings changes

## [4.0.0] - 2024-09-24

### Changed
- Updated import statements in extension.js to follow new GNOME Shell guidelines
- Replaced old-style imports with new ES6 module imports
- Updated imports for GObject, St, Clutter, Main, PanelMenu, and GLib
- Changed ExtensionUtils import to use the new Extension class
- Updated the PrayTimes import to use ES6 module syntax
- Refactored the Extension class to extend the new Extension base class
- Replaced Mainloop usage with GLib for timeout functionality

### Improved
- Compatibility with newer versions of GNOME Shell
- Adherence to best practices for GNOME Shell extension development

## [3.0.0] - 2023-09-21

### Added
- Compatibility with GNOME Shell 45 and 46

### Changed
- Updated metadata.json to include support for GNOME Shell versions 44, 45, and 46
- Incremented extension version to 3

## [2.0.0] - 2023-05-14

### Added
- Compatibility with GNOME Shell 44 and Ubuntu 24
- User-configurable settings for latitude, longitude, and calculation method
- Settings schema for managing extension preferences
- Automatic updates of prayer times every minute

### Changed
- Refactored extension structure to use latest GNOME Shell standards
- Separated PrayTimes calculation into its own module
- Updated metadata.json with new compatibility information

### Fixed
- Issues preventing the extension from working on Ubuntu 24

## [1.0.0] - Initial Release

- Basic functionality to display prayer times in the GNOME Shell top panel