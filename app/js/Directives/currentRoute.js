/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function currentRouteDirective(){
        return {
            restrict: 'EA',
            templateUrl: 'templates/currentRoute.html',
            scope: {
                route: '=route',
                mapCtrl: '=methods'
            },
            transclude: true,

            link: function($scope, el, attr, ctrl){
                $scope.completeRoute = function(){
                    $scope.mapCtrl.completeRoute();
                    //$scope.route = {};
                }
            }
        }
    }

    return currentRouteDirective;

})