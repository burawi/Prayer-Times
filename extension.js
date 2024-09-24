'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as PrayTimesModule from './praytimes.js';
const PrayTimes = PrayTimesModule.PrayTimes;

import Translations from './translations.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(settings, extension) {
        super._init(0.0, 'Prayer Times Indicator');

        this._settings = settings;
        this._extension = extension;
        this._label = new St.Label({
            text: 'Prayer Times',
            y_align: Clutter.ActorAlign.CENTER
        });

        this.add_child(this._label);

        this._prayTimes = new PrayTimes();
        this._prayTimes.setMethod(this._settings.get_string('calculation-method'));
        
        this._createMenu();
        this._updateTimer();

        this._settingsChangedId = this._settings.connect('changed', this._onSettingsChanged.bind(this));
    }

    _getCurrentLanguage() {
        return this._settings.get_string('language') || 'en';
    }

    _getTranslation(key) {
        const lang = this._getCurrentLanguage();
        return Translations[lang][key] || key;
    }

    _createMenu() {
        this.menu.removeAll();
        let date = new Date();
        let lat = this._settings.get_double('latitude');
        let lng = this._settings.get_double('longitude');
        let times = this._prayTimes.getTimes(date, [lat, lng], 'auto');

        for (let prayerName in times) {
            if (prayerName === 'imsak' || prayerName === 'midnight' || prayerName === 'sunset') continue;
            let prayerTime = times[prayerName];
            let translatedPrayerName = this._getTranslation(prayerName);
            let menuItem = new PopupMenu.PopupMenuItem(`${translatedPrayerName}: ${prayerTime}`);
            this.menu.addMenuItem(menuItem);
        }

        // Add a separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Add the gear icon button
        this._addSettingsButton();
    }

    _addSettingsButton() {
        let settingsButton = new PopupMenu.PopupMenuItem(this._getTranslation('Settings'));
        settingsButton.add_child(new St.Icon({
            icon_name: 'emblem-system-symbolic',
            style_class: 'popup-menu-icon',
        }));
        settingsButton.connect('activate', () => {
            this.menu.close();
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsButton);
    }

    _updateTimer() {
        let date = new Date();
        let lat = this._settings.get_double('latitude');
        let lng = this._settings.get_double('longitude');
        let times = this._prayTimes.getTimes(date, [lat, lng], 'auto');

        let nextPrayer = this._getNextPrayer(times);
        this._label.set_text(`${this._getTranslation('Next Prayer')}: ${nextPrayer.translatedName} ${nextPrayer.time}`);

        this._createMenu();

        // Update every minute
        this._removeTimeout();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this._updateTimer();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _getNextPrayer(times) {
        let now = new Date();
        let currentTime = now.getHours() * 60 + now.getMinutes();

        for (let prayerName in times) {
            if (prayerName === 'imsak' || prayerName === 'midnight' || prayerName === 'sunset') continue;
            let [hours, minutes] = times[prayerName].split(':');
            let prayerTime = parseInt(hours) * 60 + parseInt(minutes);

            if (prayerTime > currentTime) {
                return { 
                    name: prayerName, 
                    translatedName: this._getTranslation(prayerName),
                    time: times[prayerName] 
                };
            }
        }

        // If all prayers have passed, return the first prayer of the next day
        let firstPrayer = Object.entries(times).find(([name, _]) => 
            name !== 'imsak' && name !== 'midnight' && name !== 'sunset'
        );
        return { 
            name: firstPrayer[0], 
            translatedName: this._getTranslation(firstPrayer[0]),
            time: firstPrayer[1] 
        };
    }

    _onSettingsChanged() {
        this._prayTimes.setMethod(this._settings.get_string('calculation-method'));
        this._updateTimer();
    }

    _removeTimeout() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
    }

    destroy() {
        this._removeTimeout();
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        super.destroy();
    }
});

export default class PrayerTimesExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new Indicator(this._settings, this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
    }
}
