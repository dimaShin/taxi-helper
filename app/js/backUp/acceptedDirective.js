/**
 * Created by iashind on 18.11.14.
 */
'use strict';
define(['app', 'Directives/newRouteDirective'], function(app){

    app.directive('acceptedRoute', function() {
        return {
            restrict: 'EA',
            templateUrl: 'templates/accepted.html',
            scope: {
                accepted: '=route'
            },
            compile: function(){
                return {
                    pre: function($scope, el, attr, ctrl){
                        if($(window).width() < 500){
                            el.css({
                                width: $(window).width() + 'px',
                                left: 0
                            });
                        }else {
                            el.css({
                                width: '500px',
                                left: (($(window).width() - 500) / 2) + 'px'
                            })
                        }
                    },
                    post: function($scope, el, attr, ctrl){

                    }
                }
            },
            controller: function($scope){
                $scope.contentVisibility = false;
            }
        }
    })
});
