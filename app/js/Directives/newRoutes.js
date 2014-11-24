/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function newRoutesDirective(){
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
                $scope.slide = function(direction){
                    var marginLeft = parseInt($('ul#slider').css('marginLeft')),
                        liWidth = $('ul#slider li').width()  + pad;
                    if(direction === 'left'){
                        if(marginLeft === 0) return;
                        $('ul#slider').animate({
                            marginLeft: "+=" + liWidth
                        })
                    }
                    if(direction === 'right'){
                        if((marginLeft - liWidth) <= -$('ul#slider').width() + (pad * $scope.routes.length)) return;
                        $('ul#slider').animate({
                            marginLeft: "-=" + liWidth
                        })
                    }
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