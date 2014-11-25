/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function newRoutesDirective($timeout, $swipe){
        var maxWidth = 700,
            pad = 10;
        return {
            restrict: 'EA',
            templateUrl: 'templates/newRoute.html',
            scope: {
                routes: '=routes',
                mapCtrl: '=methods',
                onTheRoute: '='
            },
            transclude: true,
            compile: function(){

                return {
                    pre: function($scope, el, attr, ctrl){
                        console.log($scope.routes);
                        if($(window).width() < maxWidth){
                            el.css({
                                width: $(window).width() + 'px',
                                left: 0
                            })
                        }else {
                            el.css({
                                width: maxWidth + 'px',
                                left: (($(window).width() - maxWidth) / 2) + 'px'
                            })
                        }
                    },
                    post: function($scope, el, attr, ctrl){

                        $scope.$watch(function($scope){
                            return $scope.routes.length;
                        }, function(){
                            var slider = $('ul#slider'),
                                li = $('ul#slider li');
                            li.width(el.width() - 10);
                            slider.width(el.width() * $scope.routes.length + (pad * $scope.routes.length)).css('marginLeft', 0);
                        })
                    }
                }
            },
            controller: function($scope){
                var isAnimationInProgress = false,
                    slider = $('ul#slider');
                console.log('swipe: ', $swipe);
                $scope.originals = {};
                $swipe.bind($('ul#slider'), {
                    start: function(e){
                        $scope.originals.marginLeft = parseInt(slider.css('marginLeft'));
                        $scope.originals.posX = e.x;
                        $scope.originals.width = slider.width();
                        $scope.originals.liWidth = $('ul#slider li').width();
                    },
                    move: function(e){
                        var newMargin = $scope.originals.marginLeft - ($scope.originals.posX - e.x),
                            rightLimit = $scope.originals.width - $scope.originals.liWidth;
                        if(newMargin > 0 || Math.abs(newMargin) + (pad * $scope.routes.length) > rightLimit) return;
                        slider.css({
                            marginLeft: $scope.originals.marginLeft - ($scope.originals.posX - e.x)
                        });
                    },
                    end: function(){
                        var marginDiff = Math.abs(parseInt(slider.css('marginLeft'))) - Math.abs($scope.originals.marginLeft);
                        if(marginDiff === 0) return;
                        (marginDiff < 0)
                                ? $scope.slide('left', $scope.originals.marginLeft)
                                : $scope.slide('right', $scope.originals.marginLeft)
                    },
                    cancel: function(){
                        slider.css({
                            marginLeft: $scope.originals.marginLeft
                        });
                    }
                });
                $scope.slide = function(direction, marginLeft){
                    if(isAnimationInProgress) return;
                    var liWidth = $('ul#slider li').width() + pad,
                        newValue;
                    if(marginLeft === undefined){
                        var marginLeft = parseInt(slider.css('marginLeft'));
                    }
                    if(direction === 'left'){
                        if(marginLeft === 0) {
                            slider.css({marginLeft: marginLeft});
                            return;
                        }
                        newValue = marginLeft + liWidth;
                    }
                    if(direction === 'right'){
                        if((marginLeft - liWidth) <= -slider.width() + (pad * $scope.routes.length)) {
                            slider.css({marginLeft: marginLeft});
                            return;
                        }
                        newValue = marginLeft - liWidth;
                    }
                    isAnimationInProgress = true;
                    slider.animate({
                        marginLeft: newValue
                    }).promise().then(function(){
                        isAnimationInProgress = false;
                    });
                };

                $scope.cancelRoute = function(route){
                    $scope.mapCtrl.cancelRoute(route);
                }
            }
        }
    }

    return newRoutesDirective;

});