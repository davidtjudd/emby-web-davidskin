define(['loading', 'backdrop', 'connectionManager', 'scroller', 'globalize', 'require', './../components/focushandler', 'emby-itemscontainer', 'emby-tabs'], function (loading, backdrop, connectionManager, scroller, globalize, require, focusHandler) {
    'use strict';

    function createVerticalScroller(instance, view) {

        var scrollFrame = view.querySelector('.scrollFrame');

        var options = {
            horizontal: 0,
            slidee: view.querySelector('.scrollSlider'),
            scrollBy: 200,
            speed: 270,
            scrollWidth: 50000,
            immediateSpeed: 160
        };

        instance.scroller = new scroller(scrollFrame, options);
        instance.scroller.init();

        instance.focusHandler = new focusHandler({
            parent: view.querySelector('.scrollSlider'),
            scroller: instance.scroller,
            enableBackdrops: false
        });
    }

    return function (view, params) {

        var self = this;

        var tabControllers = [];
        var currentTabController;

        function getTabController(page, index, callback) {

            var depends = [];

            switch (index) {

                case 0:
                    depends.push('./suggestions');
                    break;
                case 1:
                    depends.push('./suggestions');
                    break;
                case 2:
                    depends.push('./channels');
                    break;
                case 3:
                    depends.push('./recordings');
                    break;
                case 4:
                    depends.push('./schedule');
                    break;
                case 5:
                    depends.push('./series');
                    break;
                default:
                    break;
            }

            require(depends, function (controllerFactory) {

                var controller = tabControllers[index];
                if (!controller) {
                    var tabContent = view.querySelector('.tabContent[data-index=\'' + index + '\']');
                    controller = new controllerFactory(tabContent, params, view);
                    tabControllers[index] = controller;
                }

                callback(controller);
            });
        }


        function preLoadTab(page, index) {

            getTabController(page, index, function (controller) {
                if (controller.onBeforeShow) {
                    controller.onBeforeShow();
                }
            });
        }

        function loadTab(page, index) {

            getTabController(page, index, function (controller) {

                controller.onShow();
                currentTabController = controller;
            });
        }

        createVerticalScroller(self, view);

        var viewTabs = view.querySelector('.viewTabs');
        var initialTabIndex = parseInt(params.tab || '0');

        viewTabs.addEventListener('beforetabchange', function (e) {
            preLoadTab(view, parseInt(e.detail.selectedTabIndex));
        });

        viewTabs.addEventListener('tabchange', function (e) {

            var previousTabController = tabControllers[parseInt(e.detail.previousIndex)];
            if (previousTabController && previousTabController.onHide) {
                previousTabController.onHide();
            }

            loadTab(view, parseInt(e.detail.selectedTabIndex));
        });

        view.addEventListener('viewbeforehide', function (e) {

            if (currentTabController && currentTabController.onHide) {
                currentTabController.onHide();
            }
        });

        view.addEventListener('viewbeforeshow', function () {
            if (initialTabIndex == null) {
                viewTabs.triggerBeforeTabChange();
            }
        });

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle(globalize.translate('LiveTV'));
            backdrop.clear();

            if (initialTabIndex != null) {
                viewTabs.selectedIndex(initialTabIndex);
                initialTabIndex = null;
            } else {
                viewTabs.triggerTabChange();
            }
        });

        view.addEventListener('viewdestroy', function (e) {

            tabControllers.forEach(function (t) {
                if (t.destroy) {
                    t.destroy();
                }
            });

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null;
            }

            if (self.scroller) {
                self.scroller.destroy();
                self.scroller = null;
            }
        });
    };

});