define(['userSettings', './skininfo'], function (userSettings, skininfo) {
    'use strict';

    var settingsPrefix = skininfo.id + '-';
    var obj = function () {

        var self = this;

        self.set = function (name, value) {

            userSettings.set(settingsPrefix + name, value);
        };

        self.get = function (name) {

            return userSettings.get(settingsPrefix + name);
        };

        self.enableAntiSpoliers = function (val) {

            if (val != null) {
                self.set('antispoilers', val.toString());
            }

            return self.get('antispoilers') !== 'false';
        };

        self.enableGroupNewMovies = function (val) {

            if (val != null) {
                self.set('groupnewmovies', val.toString());
            }

            return self.get('groupnewmovies') === 'true';
        };

        self.enableMovieDetailScenes = function (val) {

            if (val != null) {
                self.set('moviedetailscenes', val.toString());
            }

            return self.get('moviedetailscenes') === 'true';
        };

        self.enableEpisodeDetailScenes = function (val) {

            if (val != null) {
                self.set('episodedetailscenes', val.toString());
            }

            return self.get('episodedetailscenes') === 'true';
        };

        self.enableOtherDetailScenes = function (val) {

            if (val != null) {
                self.set('otherdetailscenes', val.toString());
            }

            return self.get('otherdetailscenes') === 'true';
        };

        self.apply = function () {
        };

        self.unload = function () {
        };
    };

    return new obj();
});