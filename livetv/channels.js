define(['cardBuilder', 'imageLoader', 'loading', 'connectionManager', 'apphost', 'layoutManager', 'scrollHelper', 'emby-itemscontainer'], function (cardBuilder, imageLoader, loading, connectionManager, appHost, layoutManager, scrollHelper) {
    'use strict';

    function LiveTvChannelsTab(view, params) {
        this.view = view;
        this.params = params;
        this.apiClient = connectionManager.getApiClient(params.serverId);
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

    LiveTvChannelsTab.prototype.onBeforeShow = function () {

        var apiClient = this.apiClient;
        var promises = [];

        promises.push(apiClient.getLiveTvChannels({

            UserId: apiClient.getCurrentUserId(),
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary",
            EnableTotalRecordCount: false,
            Fields: "ChannelInfo,PrimaryImageAspectRatio"
        }));

        this.promises = promises;
    };

    LiveTvChannelsTab.prototype.onShow = function () {

        var promises = this.promises;
        if (!promises) {
            return;
        }

        var view = this.view;

        promises[0].then(function (result) {
            renderItems(view, result.Items, 'itemsContainer');
        });

    };

    LiveTvChannelsTab.prototype.onHide = function () {

    };

    LiveTvChannelsTab.prototype.destroy = function () {

        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.promises = null;
    };

    return LiveTvChannelsTab;
});