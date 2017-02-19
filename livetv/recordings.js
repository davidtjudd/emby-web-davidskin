define(['cardBuilder', 'imageLoader', 'loading', 'connectionManager', 'apphost', 'datetime', 'layoutManager', 'scrollHelper', 'emby-itemscontainer'], function (cardBuilder, imageLoader, loading, connectionManager, appHost, datetime, layoutManager, scrollHelper) {
    'use strict';

    function enableScrollX() {
        return !layoutManager.desktop;
    }

    function LiveTvRecordingsTab(view, params) {
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
                section.querySelector('.sectionTitle').classList.add('padded-left');

                if (elem) {
                    elem.classList.add('focuscontainer-x');
                    elem.classList.add('padded-left');
                    elem.classList.add('padded-right');

                    elem.classList.remove('vertical-wrap');

                    elem.classList.add('hiddenScrollX');

                    if (layoutManager.tv) {
                        elem.classList.add('padded-top-focusscale');
                        elem.classList.add('padded-bottom-focusscale');
                        scrollHelper.centerFocus.on(elem, true);
                    }
                }

            } else {
                if (elem) {
                    elem.classList.add('vertical-wrap');
                }
            }
        }

        if (!enableScrollX()) {
            view.classList.add('padded-left');
            view.classList.add('padded-right');
        }
    }

    function getBackdropShape() {
        return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
    }

    function renderItems(view, items, sectionClass, overlayButton, cardOptions) {

        var supportsImageAnalysis = appHost.supports('imageanalysis');
        var cardLayout = supportsImageAnalysis;

        cardOptions = cardOptions || {};

        var html = cardBuilder.getCardsHtml(Object.assign({
            items: items,
            shape: "square",
            showTitle: true,
            lazy: true,
            cardLayout: true,
            showDetailsMenu: true,
            showCurrentProgram: true

        }, cardOptions));

        var elem = view.querySelector('.' + sectionClass);

        elem.innerHTML = html;
        imageLoader.lazyChildren(elem);
    }

    LiveTvRecordingsTab.prototype.onBeforeShow = function () {

        var apiClient = this.apiClient;
        var promises = [];

        promises.push(apiClient.getLiveTvRecordings({
            UserId: apiClient.getCurrentUserId(),
            IsInProgress: true,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            EnableImageTypes: "Primary,Thumb,Backdrop"
        }));

        promises.push(apiClient.getLiveTvRecordings({
            UserId: apiClient.getCurrentUserId(),
            Limit: enableScrollX() ? 12 : 8,
            IsInProgress: false,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            EnableImageTypes: "Primary,Thumb,Backdrop"
        }));

        promises.push(apiClient.getLiveTvRecordings({

            UserId: apiClient.getCurrentUserId(),
            Limit: enableScrollX() ? 12 : 8,
            IsInProgress: false,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            IsMovie: true
        }));

        promises.push(apiClient.getLiveTvRecordingSeries({
            UserId: apiClient.getCurrentUserId(),
            Limit: enableScrollX() ? 12 : 8,
            IsInProgress: false,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            IsSeries: true
        }));

        promises.push(apiClient.getLiveTvRecordings({

            UserId: apiClient.getCurrentUserId(),
            Limit: enableScrollX() ? 12 : 8,
            IsInProgress: false,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            IsKids: true
        }));

        promises.push(apiClient.getLiveTvRecordings({
            UserId: apiClient.getCurrentUserId(),
            Limit: enableScrollX() ? 12 : 8,
            IsInProgress: false,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            IsSports: true
        }));

        promises.push(apiClient.getLiveTvRecordingGroups({

            userId: apiClient.getCurrentUserId()
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

    LiveTvRecordingsTab.prototype.onShow = function () {

        var promises = this.promises;
        if (!promises) {
            return;
        }

        var view = this.view;

        promises[0].then(function (result) {
            renderActiveRecordings(view, result.Items);
        });

        promises[1].then(function (result) {

            renderRecordings(view.querySelector('.latestRecordings'), result.Items, {
                shape: (enableScrollX() ? 'overflowBackdrop' : 'backdrop'),
                showYear: true,
                lines: 2
            });
        });

        promises[2].then(function (result) {

            renderRecordings(view.querySelector('.movieRecordings'), result.Items, {
                showYear: true,
                showParentTitle: false
            });
        });

        promises[3].then(function (result) {

            renderRecordings(view.querySelector('.episodeRecordings'), result.Items, {
                showSeriesYear: true,
                showParentTitle: false
            });
        });

        promises[4].then(function (result) {

            renderRecordings(view.querySelector('.sportsRecordings'), result.Items, {
                showYear: true,
                showParentTitle: false
            });
        });

        promises[5].then(function (result) {

            renderRecordings(view.querySelector('.kidsRecordings'), result.Items, {
                shape: (enableScrollX() ? 'overflowBackdrop' : 'backdrop'),
                showYear: true,
                lines: 2
            });
        });
    };

    LiveTvRecordingsTab.prototype.onHide = function () {

    };

    LiveTvRecordingsTab.prototype.destroy = function () {

        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.promises = null;
    };

    return LiveTvRecordingsTab;
});