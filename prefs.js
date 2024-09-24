'use strict';

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PrayertimePrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        window.add(page);

        const group = new Adw.PreferencesGroup();
        page.add(group);

        // Latitude
        const latitudeRow = new Adw.ActionRow({ title: _('Latitude') });
        group.add(latitudeRow);

        const latitudeSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: -90,
                upper: 90,
                step_increment: 0.0001,
            }),
            digits: 4,
        });
        latitudeRow.add_suffix(latitudeSpinButton);
        latitudeRow.activatable_widget = latitudeSpinButton;

        settings.bind('latitude', latitudeSpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Longitude
        const longitudeRow = new Adw.ActionRow({ title: _('Longitude') });
        group.add(longitudeRow);

        const longitudeSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: -180,
                upper: 180,
                step_increment: 0.0001,
            }),
            digits: 4,
        });
        longitudeRow.add_suffix(longitudeSpinButton);
        longitudeRow.activatable_widget = longitudeSpinButton;

        settings.bind('longitude', longitudeSpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Calculation Method
        const methodRow = new Adw.ActionRow({ title: _('Calculation Method') });
        group.add(methodRow);

        const methodComboBox = new Gtk.ComboBoxText();
        methodComboBox.append('DIYANET', _('Diyanet'));
        methodComboBox.append('MWL', _('Muslim World League'));
        methodComboBox.append('ISNA', _('Islamic Society of North America'));
        methodRow.add_suffix(methodComboBox);
        methodRow.activatable_widget = methodComboBox;

        settings.bind('calculation-method', methodComboBox, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        // Language
        const languageRow = new Adw.ActionRow({ title: _('Language') });
        group.add(languageRow);

        const languageComboBox = new Gtk.ComboBoxText();
        languageComboBox.append('ar', _('Arabic'));
        languageComboBox.append('en', _('English'));
        languageComboBox.append('fr', _('French'));
        languageComboBox.append('tr', _('Turkish'));
        languageComboBox.append('ms', _('Malay'));
        languageComboBox.append('ur', _('Urdu'));
        languageComboBox.append('fa', _('Persian'));
        languageComboBox.append('bs', _('Bosnian'));
        languageComboBox.append('ber_tfng', _('Amazigh (Tifinagh)'));
        languageComboBox.append('ber_arab', _('Amazigh (Arabic script)'));
        languageComboBox.append('sw', _('Swahili'));
        languageComboBox.append('es', _('Spanish'));
        languageComboBox.append('it', _('Italian'));
        languageComboBox.append('de', _('German'));
        languageComboBox.append('ru', _('Russian'));
        languageComboBox.append('zh', _('Chinese'));
        languageComboBox.append('id', _('Indonesian'));
        languageComboBox.append('hi', _('Hindi'));
        languageRow.add_suffix(languageComboBox);
        languageRow.activatable_widget = languageComboBox;

        settings.bind('language', languageComboBox, 'active-id', Gio.SettingsBindFlags.DEFAULT);
    }
}