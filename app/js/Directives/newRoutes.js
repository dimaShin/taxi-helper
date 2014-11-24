/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function newRoutesDirective($timeout){
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
                var isAnimationInProgress = false;

                $scope.slide = function(direction){
                    if(isAnimationInProgress) return;
                    var slider = $('ul#slider'),
                        marginLeft = parseInt(slider.css('marginLeft')),
                        liWidth = $('ul#slider li').width()  + pad,
                        newValue;
                    if(direction === 'left'){
                        if(marginLeft === 0) return;
                        newValue = marginLeft + liWidth;
                    }
                    if(direction === 'right'){
                        if((marginLeft - liWidth) <= -slider.width() + (pad * $scope.routes.length)) return;
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
                    //var index = $scope.routes.indexOf(route);
                    //$scope.routes.splice(index, 1);
                    $scope.mapCtrl.cancelRoute(route);
                }
            }
        }
    }

    return newRoutesDirective;

});