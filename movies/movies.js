define(['loading', 'alphaPicker', './../components/horizontallist', './../components/tabbedpage', 'backdrop', 'inputManager', 'focusManager', 'dom', './../skinsettings', 'emby-itemscontainer'], function (loading, alphaPicker, horizontalList, tabbedPage, backdrop, inputManager, focusManager, dom, skinSettings) {
    'use strict';

    return function (view, params) {

        var self = this;

        window.focusManager = focusManager;

        function pageList(isDown, focusedElement, focusMan) {
            var sliderObj = document.querySelector('.contentScrollSlider');
            var sliderScrollWidth = sliderObj.clientWidth;
            //get the col
            var focusedParent = focusedElement.parentNode;
            var focusedTopParent = focusedParent.parentNode;
            if (focusedTopParent.classList.contains("horizontalSection"))
                focusedParent = focusedTopParent;
            //get the current cols index in the slider
            var colIdx = Array.prototype.indexOf.call(focusedParent.parentNode.childNodes, focusedParent);
            var colWidth = focusedParent.clientWidth;
            //get the number it should move
            var moveCount = Math.ceil((sliderScrollWidth - colWidth) / 2 / colWidth);
            var jump = -Math.abs(moveCount);
            if (isDown === true)
                jump = Math.abs(moveCount);
            jump = jump + colIdx;
            if (jump < 0)
                jump = 0;
            //var newSelectedParent=focusedParent.parentNode.childNodes[jump+colIdx];

            var newSelectedParent = sliderObj.childNodes[jump];
            if (jump >= sliderObj.childNodes.length)
                newSelectedParent = sliderObj.lastChild;
            var newFocus = newSelectedParent.childNodes[0];
            if (newFocus != null) {
                if (newFocus.classList.contains("sectionTitle"))
                    newFocus = newSelectedParent.childNodes[1].childNodes[0];//for grouped items
                newFocus.focus();
                focusMan.focus(newFocus);
                //focusedElement = newFocus;
                //if (options.scroller) {
                //    var now = new Date().getTime();
                //    var animate = (now - lastFocus) > 50;
                //    options.scroller.toCenter(newFocus, !animate);
                //    lastFocus = now;
                //}
            };

            return false;
        };

        function onKeyDown(e) {
            if (e.keyCode === 34 || e.keyCode === 33) {
                //e.preventDefault();
                var isDown = false;
                if (e.keyCode === 34)
                    isDown = true;
                var target = focusManager.focusableParent(e.target);
                pageList(isDown, target, window.focusManager);
            }
        };

        function onInputCommand(e) {

            switch (e.detail.command) {
                case 'channeldown':
                    e.preventDefault();
                    pageList(true, e.target, window.focusManager);
                    break;
                case 'channelup':
                    e.preventDefault();
                    pageList(false, e.target, window.focusManager);
                    break;
                case 'pagedown':
                    e.preventDefault();
                    pageList(true, e.target, window.focusManager);
                    break;
                case 'pageup':
                    e.preventDefault();
                    pageList(false, e.target, window.focusManager);
                    break;
                default:
                    break;
            }
        }

        view.addEventListener('viewshow', function (e) {
            var slider = document.querySelector('.contentScrollSlider');
            inputManager.on(slider, onInputCommand);
            //from ods
            //dom.addEventListener(window, 'keydown', onKeyDown, {
            //    passive: true
            //});
            if (!self.tabbedPage) {
                loading.show();
                renderTabs(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewbeforehide', function () {
            var slider = document.querySelector('.contentScrollSlider');
            inputManager.off(slider, onInputCommand);
            //dom.removeEventListener(window, 'keydown', onKeyDown, {
            //    passive: true
            //});
        });

        view.addEventListener('viewdestroy', function () {

            if (self.listController) {
                self.listController.destroy();
            }
            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            var tabs = [
                {
                    Name: Globalize.translate('Date Added'),
                    Id: "dateadded"
                },
                {
                    Name: Globalize.translate('Movies'),
                    Id: "movies"
                },
                {
                    Name: Globalize.translate('Unwatched'),
                    Id: "unwatched"
                },
                {
                    Name: Globalize.translate('Collections'),
                    Id: "collections"
                },
                {
                    Name: Globalize.translate('Genres'),
                    Id: "genres"
                },
                {
                    Name: Globalize.translate('Years'),
                    Id: "years"
                },
                {
                    Name: Globalize.translate('TopRated'),
                    Id: "toprated"
                },
                {
                    Name: Globalize.translate('Favorites'),
                    Id: "favorites"
                }
            ];

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });

            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                showAlphaPicker(false);

                switch (id) {

                    case 'dateadded':
                        renderNewMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'movies':
                        renderMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'unwatched':
                        renderUnwatchedMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'years':
                        renderYears(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'toprated':
                        renderTopRated(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'collections':
                        renderCollections(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'favorites':
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'genres':
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    default:
                        break;
                }

            });
        }

        function renderGenres(page, pageParams, autoFocus, scroller, resolve) {

            Emby.Models.genres({
                ParentId: pageParams.parentid,
                SortBy: "SortName"

            }).then(function (genresResult) {

                self.listController = new horizontalList({
                    itemsContainer: page.querySelector('.contentScrollSlider'),
                    Page: page,
                    getItemsMethod: function (startIndex, limit) {
                        return Emby.Models.items({
                            StartIndex: startIndex,
                            Limit: limit,
                            ParentId: pageParams.parentid,
                            IncludeItemTypes: "Movie",
                            Recursive: true,
                            SortBy: "SortName",
                            Fields: "Genres"
                        });
                    },
                    listCountElement: page.querySelector('.listCount'),
                    listNumbersElement: page.querySelector('.listNumbers'),
                    autoFocus: autoFocus,
                    selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                    selectedIndexElement: page.querySelector('.selectedIndex'),
                    scroller: scroller,
                    onRender: function () {
                        if (resolve) {
                            resolve();
                            resolve = null;
                        }
                    },
                    cardOptions: {
                        indexBy: 'Genres',
                        genres: genresResult.Items,
                        indexLimit: 4,
                        parentId: pageParams.parentid,
                        rows: {
                            portrait: 2,
                            square: 3,
                            backdrop: 3
                        },
                        scalable: false
                    }
                });

                self.listController.render();
            });
            window.activeListView = self.listController;
        }

        function renderFavorites(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        Filters: "IsFavorite",
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderMovies(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                    showAlphaPicker(true);
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
            
        }

        function renderNewMovies(page, pageParams, autoFocus, scroller, resolve) {
            var newMoviesOptions = {
                //indexBy: 'DateCreated',
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false
            };
            if (skinSettings.enableGroupNewMovies())
                newMoviesOptions['indexBy'] = 'DateCreated';
            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.latestItems({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "DateCreated,SortName",
                        SortOrder: "Descending",
                        Fields: "SortName, DateCreated"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                //cardOptions: {
                //    //TODO: make this a setting - if we send indexby we can group
                //    indexBy: 'DateCreated',
                //    rows: {
                //        portrait: 2,
                //        square: 3,
                //        backdrop: 3
                //    },
                //    scalable: false
                //}
                cardOptions: newMoviesOptions
            });

            self.listController.render();
        }

        function renderUnwatchedMovies(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName",
                        IsPlayed: false
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                    showAlphaPicker(true);
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderCollections(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.collections({
                        StartIndex: startIndex,
                        Limit: limit,
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderYears(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "ProductionYear,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'ProductionYear',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderTopRated(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                Page: page,
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "CommunityRating,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'CommunityRating',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function showAlphaPicker(show) {
            if (self.alphaPicker) {
                self.alphaPicker.visible(show);
                self.alphaPicker.enabled(show);
            };
        };
    };
});