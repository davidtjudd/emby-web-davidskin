define(['cardBuilder', 'imageLoader', 'loading', 'connectionManager', 'apphost', 'layoutManager', 'scrollHelper', 'emby-itemscontainer'], function (cardBuilder, imageLoader, loading, connectionManager, appHost, layoutManager, scrollHelper) {
    'use strict';

    function enableScrollX() {
        return !layoutManager.desktop;
    }

    function LiveTvSuggestionsTab(view, params) {
        this.view = view;
        this.params = params;
        this.apiClient = connectionManager.getApiClient(params.serverId);

        initLayout(view);
    }

    function initLayout(view) {

        var containers = view.querySelectorAll('.verticalSection');

        for (var i = 0, length = containers.length; i < length; i++) {

            var section = containers[i];

            var elem = section.querySelector('.itemsContainer');

            if (enableScrollX()) {
                elem.classList.add('padded-left');
                elem.classList.add('padded-right');

                section.querySelector('.sectionTitle').classList.add('padded-left');

                elem.classList.remove('vertical-wrap');

                elem.classList.add('hiddenScrollX');

                if (layoutManager.tv) {
                    elem.classList.add('padded-top-focusscale');
                    elem.classList.add('padded-bottom-focusscale');
                    scrollHelper.centerFocus.on(elem, true);
                }

            } else {
                elem.classList.add('vertical-wrap');
            }
        }

        if (!enableScrollX()) {
            view.classList.add('padded-left');
            view.classList.add('padded-right');
        }
    }

    function getPortraitShape() {
        return enableScrollX() ? 'overflowPortrait' : 'portrait';
    }

    function renderItems(view, items, sectionClass, overlayButton, cardOptions) {

        var supportsImageAnalysis = appHost.supports('imageanalysis');
        var cardLayout = supportsImageAnalysis;

        cardOptions = cardOptions || {};

        var html = cardBuilder.getCardsHtml(Object.assign({
            items: items,
            preferThumb: true,
            inheritThumb: false,
            shape: (enableScrollX() ? 'overflowBackdrop' : 'backdrop'),
            showParentTitleOrTitle: true,
            showTitle: false,
            centerText: !cardLayout,
            coverImage: true,
            overlayText: false,
            lazy: true,
            overlayMoreButton: overlayButton !== 'play' && !cardLayout && !layoutManager.tv,
            overlayPlayButton: overlayButton === 'play' && !layoutManager.tv,
            allowBottomPadding: !enableScrollX(),
            showAirTime: true,
            showAirDateTime: true,
            showChannelName: true,
            vibrant: true,
            cardLayout: cardLayout

        }, cardOptions));

        var section = view.querySelector('.' + sectionClass);

        if (items.length) {
            section.classList.remove('hide');
        } else {
            section.classList.add('hide');
        }

        var elem = section.querySelector('.itemsContainer');

        elem.innerHTML = html;
        imageLoader.lazyChildren(elem);
        elem.scrollLeft = 0;
    }

    LiveTvSuggestionsTab.prototype.onBeforeShow = function () {

        var apiClient = this.apiClient;
        var promises = [];

        var limit = enableScrollX() ? 18 : 12;

        promises.push(apiClient.getLiveTvRecordings({
            UserId: apiClient.getCurrentUserId(),
            IsInProgress: true,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            EnableImageTypes: "Primary,Thumb,Backdrop"
        }));

        // on now
        promises.push(apiClient.getLiveTvRecommendedPrograms({

            UserId: apiClient.getCurrentUserId(),
            IsAiring: true,
            Limit: limit,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Thumb,Backdrop",
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo,PrimaryImageAspectRatio"

        }));

        // upcoming programs
        promises.push(apiClient.getLiveTvRecommendedPrograms({

            UserId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsMovie: false,
            IsSports: false,
            IsKids: false,
            IsSeries: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo,PrimaryImageAspectRatio",
            EnableImageTypes: "Primary,Thumb"
        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsMovie: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsSports: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        promises.push(apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: false,
            HasAired: false,
            Limit: limit,
            IsKids: true,
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo",
            EnableImageTypes: "Primary,Thumb"

        }));

        this.promises = promises;
    };

    function renderRecordings(elem, recordings, cardOptions) {

        if (recordings.length) {
            elem.classList.remove('hide');
        } else {
            elem.classList.add('hide');
        }

        var recordingItems = elem.querySelector('.itemsContainer');

        if (enableScrollX()) {
            recordingItems.classList.add('hiddenScrollX');
            recordingItems.classList.remove('vertical-wrap');
        } else {
            recordingItems.classList.remove('hiddenScrollX');
            recordingItems.classList.add('vertical-wrap');
        }

        recordingItems.innerHTML = cardBuilder.getCardsHtml(Object.assign({
            items: recordings,
            shape: (enableScrollX() ? 'autooverflow' : 'auto'),
            showTitle: true,
            showParentTitle: true,
            coverImage: true,
            lazy: true,
            cardLayout: true,
            vibrant: true,
            allowBottomPadding: !enableScrollX(),
            preferThumb: 'auto'

        }, cardOptions || {}));

        imageLoader.lazyChildren(recordingItems);
    }

    function getBackdropShape() {
        return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
    }

    function renderActiveRecordings(context, items) {

        renderRecordings(context.querySelector('.activeRecordings'), items, {
            shape: getBackdropShape(),
            showParentTitle: false,
            showTitle: true,
            showAirTime: true,
            showAirEndTime: true,
            showChannelName: true,
            cardLayout: true,
            vibrant: true,
            preferThumb: true,
            coverImage: true,
            overlayText: false
        });
    }

    LiveTvSuggestionsTab.prototype.onShow = function () {

        var promises = this.promises;
        if (!promises) {
            return;
        }

        var view = this.view;

        promises[0].then(function (result) {
            renderActiveRecordings(view, result.Items);
        });

        promises[1].then(function (result) {
            renderItems(view, result.Items, 'activePrograms');
        });

        promises[2].then(function (result) {
            renderItems(view, result.Items, 'upcomingPrograms');
        });

        promises[3].then(function (result) {
            renderItems(view, result.Items, 'upcomingTvMovies', null, {
                shape: getPortraitShape(),
                preferThumb: null
            });
        });

        promises[4].then(function (result) {
            renderItems(view, result.Items, 'upcomingSports');
        });

        promises[5].then(function (result) {
            renderItems(view, result.Items, 'upcomingKids');
        });

    };

    LiveTvSuggestionsTab.prototype.onHide = function () {

    };

    LiveTvSuggestionsTab.prototype.destroy = function () {

        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.promises = null;
    };

    return LiveTvSuggestionsTab;
});