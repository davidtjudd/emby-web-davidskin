define(['imageLoader', 'itemHelper', 'backdrop', 'mediaInfo', 'focusManager', 'scrollHelper', 'browser', 'layoutManager', 'dom', 'inputManager'],
    function (imageLoader, itemHelper, backdrop, mediaInfo, focusManager, scrollHelper, browser, layoutManager, dom, inputManager) {
        'use strict';

        var enableAnimations = browser.animate || browser.edge;
        var zoomInEase = 'ease-out';
        var zoomOutEase = 'ease-in';
        var zoomDuration = 200;

        function zoomOut(elem, scaleSize) {

            var keyframes = [
            { transform: 'scale(' + scaleSize + ')  ', offset: 0 },
            { transform: 'scale(1)', offset: 1 }
            ];

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomOutEase };
                elem.animate(keyframes, timing);
            }
        }

        function fadeIn(elem) {

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 140, iterations: 1, easing: 'ease-out' };
            return elem.animate(keyframes, timing);
        }

        function focusHandler(options) {

            var self = this;

            var parent = options.parent;
            var focusedElement;
            var zoomElement;
            var currentAnimation;
            var isHorizontal = options.scroller ? options.scroller.options.horizontal : options.horizontal;
            var zoomScale = options.zoomScale || (isHorizontal ? '1.16' : '1.12');
            var lastFocus = 0;
            var page = options.page;

            if (layoutManager.tv) {
                dom.addEventListener(parent, 'focus', onFocusIn, {
                    capture: true,
                    passive: true
                });
                dom.addEventListener(parent, 'blur', onFocusOut, {
                    capture: true,
                    passive: true
                });
            }

            var selectedItemInfoElement = options.selectedItemInfoElement;
            var selectedIndexElement = options.selectedIndexElement;
            var selectedItemPanel;
            if (page != null)
                page.querySelector('.contentScrollSlider').onkeydown = function (e) { onKeyDown(e) };


            function onInputCommand(e) {

                switch (e.detail.command) {
                    case 'channeldown':
                        alert("down");
                        break;
                    default:
                        break;
                }
            }

            function onKeyDown(e) {

                if (e.keyCode === 34 || e.keyCode === 33) {
                    e.preventDefault();

                    /////
                    //need to:
                    //get the round((width of the slider-the current item's width)/2)/the width of an item
                    //this will tell you how many to scroll by
                    //then get the current col and move x items
                    //what a pita

                    var sliderObj = page.querySelector('.contentScrollSlider');
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
                    if (e.keyCode === 34)
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
                        focusedElement = newFocus;
                        if (options.scroller) {
                            var now = new Date().getTime();
                            var animate = (now - lastFocus) > 50;
                            options.scroller.toCenter(newFocus, !animate);
                            lastFocus = now;
                        }
                    };
                    /////





                    //var jump = -Math.abs(moveCount);
                    //if (e.keyCode === 34)
                    //    jump = Math.abs(moveCount);
                    //if (focusedElement) {
                    //    var index = parseInt(focusedElement.getAttribute('data-index')) + jump;
                    //    if (index < 0)
                    //        index = 0;
                    //    var newFocus = contentScrollSlider.querySelector('.card[data-index^=\'' + index + '\']');
                    //    if (newFocus != null) {
                    //        newFocus.focus();
                    //        focusedElement = newFocus;
                    //    if (options.scroller) {
                    //        var now = new Date().getTime();
                    //        var animate = (now - lastFocus) > 50;
                    //        options.scroller.toCenter(newFocus, !animate);
                    //        lastFocus = now;
                    //    }

                    //    //if (selectedIndexElement) {
                    //    //    var index = parseInt(focusedElement.getAttribute('data-index')) + jump;
                    //    //    if (Math.abs(index % 2) == 1)
                    //    //        index = index + 1;
                    //    //    if (index < 0)
                    //    //        index = 0;
                    //    //    var contentScrollSlider = page.querySelector('.contentScrollSlider');
                    //    //    var rect = contentScrollSlider.clientWidth;
                    //    //    if (index > (contentScrollSlider.childElementCount*2)-2)
                    //    //        index = (contentScrollSlider.childElementCount*2)-2;
                    //    //    var newFocus = contentScrollSlider.querySelector('.card[data-index^=\'' + index + '\']');
                    //    //    if (newFocus != null) {
                    //    //        newFocus.focus();
                    //    //        focusedElement = newFocus;
                    //    //        if (options.scroller) {
                    //    //            var now = new Date().getTime();
                    //    //            var animate = (now - lastFocus) > 50;
                    //    //            options.scroller.toCenter(newFocus, !animate);
                    //    //            lastFocus = now;
                    //    //        } else if (options.scrollElement) {
                    //    //            scrollHelper.toCenter(options.scrollElement, focused, options.horizontal);
                    //    //        }
                    //    //    }
                    //    //};
                    //};

                    return false;
                }
            }

            function onFocusIn(e) {

                var focused = e.target;
                focusedElement = focused;

                if (focused) {

                    if (selectedIndexElement) {
                        var index = focused.getAttribute('data-index');
                        if (index) {
                            selectedIndexElement.innerHTML = 1 + parseInt(index);
                        }
                    }

                    if (layoutManager.tv) {
                        if (options.scroller) {
                            var now = new Date().getTime();

                            var animate = (now - lastFocus) > 50;
                            options.scroller.toCenter(focused, !animate);
                            lastFocus = now;
                        } else if (options.scrollElement) {
                            scrollHelper.toCenter(options.scrollElement, focused, options.horizontal);
                        }
                    }
                    startZoomTimer();
                }
            }

            function onFocusOut(e) {

                clearZoomTimer();
                clearSelectedInfoTimer();

                if (selectedItemInfoElement && selectedItemInfoElementHasContent) {
                    requestAnimationFrame(clearSelectedItemInfo);
                }

                var focused = focusedElement;
                focusedElement = null;

                var zoomed = zoomElement;
                zoomElement = null;

                if (zoomed) {
                    zoomOut(zoomed, zoomScale);
                }

                if (currentAnimation) {
                    currentAnimation.cancel();
                    currentAnimation = null;
                }
            }

            var zoomTimeout;
            var selectedItemInfoTimeout;
            function clearZoomTimer() {
                if (zoomTimeout) {
                    clearTimeout(zoomTimeout);
                }
            }
            function clearSelectedInfoTimer() {
                if (selectedItemInfoTimeout) {
                    clearTimeout(selectedItemInfoTimeout);
                }
            }
            function startZoomTimer() {

                clearZoomTimer();
                zoomTimeout = setTimeout(onZoomTimeout, 50);

                if (selectedItemInfoElement) {
                    clearSelectedInfoTimer();
                    selectedItemInfoTimeout = setTimeout(onSelectedInfoTimeout, 500);
                }
            }

            function onZoomTimeout() {
                var focused = focusedElement;
                if (focused) {
                    zoomIn(focused);
                }
            }

            function onSelectedInfoTimeout() {
                var focused = focusedElement;
                if (focused) {
                    setSelectedItemInfo(focused);
                }
            }

            function zoomIn(elem) {

                if (!enableAnimations) {
                    return;
                }

                var card = elem;

                var cardBox = card.querySelector('.cardBox-focustransform');

                if (!cardBox) {
                    return;
                }

                elem = cardBox;

                var keyframes = [
                    { transform: 'scale(1)  ', offset: 0 },
                  { transform: 'scale(' + zoomScale + ')', offset: 1 }
                ];

                if (currentAnimation) {
                    //currentAnimation.cancel();
                }

                var onAnimationFinished = function () {
                    currentAnimation = null;

                    zoomElement = elem;
                };

                if (elem.animate) {
                    var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomInEase };
                    var animation = elem.animate(keyframes, timing);

                    animation.onfinish = onAnimationFinished;
                    currentAnimation = animation;
                } else {
                    onAnimationFinished();
                }
            }

            function setSelectedItemInfo(card) {

                if (options.enableBackdrops !== false || selectedItemInfoElement) {

                    var id = card.getAttribute('data-id');

                    if (!id) {
                        return;
                    }

                    Emby.Models.item(id).then(function (item) {

                        if (options.enableBackdrops) {
                            // The focus backdrops are too slow on xbox
                            if (!browser.slow && !browser.edge) {
                                //backdrop.setBackdrop(item);
                            }
                        }
                        setSelectedInfo(card, item);
                    });
                }
            }

            var selectedItemInfoElementHasContent;
            function setSelectedInfo(card, item) {

                if (!selectedItemInfoElement) {
                    return;
                }

                var html = '';

                var logoImageUrl = Emby.Models.logoImageUrl(item, {
                });

                if (logoImageUrl) {

                    html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';
                }

                var mediaInfoHtml = item.Type === 'Program' ?
                    mediaInfo.getSecondaryMediaInfoHtml(item) :
                    mediaInfo.getPrimaryMediaInfoHtml(item);

                html += '<div class="selectedItemInfoDetails">';
                html += '<div class="selectedItemName">';

                if (item.AlbumArtist) {
                    html += item.AlbumArtist + " - ";
                }

                if (item.IsSeries) {
                    html += item.Name;
                } else {
                    html += itemHelper.getDisplayName(item);
                }
                html += '</div>';
                if (mediaInfoHtml) {
                    html += '<div class="selectedItemMediaInfo">';
                    html += mediaInfoHtml;
                    html += '</div>';
                }
                html += '</div>';

                //if (item.Overview && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist') {
                //    html += '<div class="overview">';
                //    html += item.Overview;
                //    html += '</div>';
                //}

                selectedItemInfoElement.innerHTML = html;
                selectedItemInfoElementHasContent = true;

                var rect = card.getBoundingClientRect();
                var left = Math.min(rect.left, dom.getWindowSize().innerWidth * 0.8);
                selectedItemInfoElement.style.left = (Math.max(left, 70)) + 'px';

                if (html && enableAnimations) {
                    fadeIn(selectedItemInfoElement, 1);
                }
            }

            function clearSelectedItemInfo() {

                selectedItemInfoElement.innerHTML = '';
                selectedItemInfoElementHasContent = false;
            }

            self.destroy = function () {

                dom.removeEventListener(parent, 'focus', onFocusIn, {
                    capture: true,
                    passive: true
                });
                dom.removeEventListener(parent, 'blur', onFocusOut, {
                    capture: true,
                    passive: true
                });

                if (selectedItemInfoElement) {
                    selectedItemInfoElement.innerHTML = '';
                }
            };
        }

        return focusHandler;
    });