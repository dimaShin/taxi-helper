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
                mapCtrl: '=methods',
                inTheQueue: '=',
                drvId: '='
            },
            transclude: true,

            link: function($scope, el, attr, ctrl){
                $scope.completeRoute = function(){
                    $scope.mapCtrl.completeRoute();
                    //$scope.route = {};
                }
            },
            controller: function($scope){
                $scope.toggleQueue = function(){
                    $scope.inTheQueue = !$scope.inTheQueue;
                    //$scope.$apply();
                }
            }
        }
    }

    return currentRouteDirective;

})