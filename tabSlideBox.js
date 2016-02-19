/**
 * Created by Heycz on 2016/2/19.
 */
"use strict";
function SimplePubSub() {
    var events = {};
    return {
        on: function (names, handler) {
            names.split(' ').forEach(function (name) {
                if (!events[name]) {
                    events[name] = [];
                }
                events[name].push(handler);
            });
            return this;
        },
        trigger: function (name, args) {
            angular.forEach(events[name], function (handler) {
                handler.call(null, args);
            });
            return this;
        }
    };
}

angular.module('tabSlideBox', [])
    .directive('tabsSlideBox', ['$timeout', '$window', '$ionicSlideBoxDelegate', '$ionicScrollDelegate',
        function ($timeout, $window, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
            return {
                restrict: 'AE',
                link: function (scope, element, attrs, ngModel) {
                    var box = element[0],
                        slider = angular.element(box.querySelector('.slider'));

                    slider.css('height', '100%');
                    var handle = box.querySelector('.slider').getAttribute('delegate-handle');
                    var ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
                    if (handle) {
                        ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(handle);
                    }

                    var ionicScrollDelegate = $ionicScrollDelegate;
                    if (handle) {
                        ionicScrollDelegate = ionicScrollDelegate.$getByHandle(handle);
                    }

                    function renderScrollableTabs() {
                        var tabsDiv = angular.element(box.querySelector(".tabs")),
                            tabs = tabsDiv.find("a"),
                            totalTabs = tabs.length;

                        angular.forEach(tabs, function (value, key) {
                            var a = angular.element(value);
                            a.on('click', function () {
                                ionicSlideBoxDelegate.slide(key);
                            });
                        });

                        var initialIndex = attrs.tab;
                        //Initializing the middle tab
                        if (typeof attrs.tab === 'undefined' || (totalTabs <= initialIndex) || initialIndex < 0) {
                            initialIndex = Math.floor(tabs.length / 2);
                        }

                        //If initial element is 0, set position of the tab to 0th tab
                        if (initialIndex == 0) {
                            setPosition(0);
                        }

                        $timeout(function () {
                            ionicSlideBoxDelegate.slide(initialIndex);
                        }, 0);
                    }

                    function setPosition(index) {
                        var tabsDiv = angular.element(box.querySelector(".tabs")),
                            tabs = tabsDiv.find("a");

                        var curEl = angular.element(tabs[index]);
                        var prvEl = angular.element(tabsDiv[0].querySelector(".active"));
                        if (curEl && curEl.length) {

                            if (prvEl.attr('icon-off')) {
                                prvEl.attr("class", prvEl.attr('icon-off'));
                            } else {
                                prvEl.removeClass("active");
                            }
                            if (curEl.attr('icon-on')) {
                                curEl.attr("class", curEl.attr('icon-on'));
                            }
                            curEl.addClass("active");
                        }
                    }

                    var events = scope.events;
                    events.on('slideChange', function (data) {
                        setPosition(data.index);
                    });
                    events.on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                        renderScrollableTabs();
                    });

                    renderScrollableTabs();
                },
                controller: function ($scope, $attrs, $element) {
                    $scope.events = new SimplePubSub();

                    $scope.slideHasChanged = function (index) {
                        $scope.events.trigger("slideChange", {"index": index});
                        $timeout(function () {
                            if ($scope.onSlideMove) $scope.onSlideMove({"index": eval(index)});
                        }, 100);
                    };

                    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                        $scope.events.trigger("ngRepeatFinished", {"event": ngRepeatFinishedEvent});
                    });
                }
            };
        }]);