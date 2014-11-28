/**
 * Created by iashind on 14.11.14.
 */
'use strict';

define(['app', 'cacheService'], function(app){



    app.controller('mainCtrl', function($scope){
        $scope.orders = [];
        $scope.accepted = {};
        $scope.showRoute = function(route, isAdditional){
            $scope.$broadcast('mainCtrl:showRoute', route, isAdditional);
        };
        $scope.cleanRoutes = function(){
            $scope.orders = [];
            $scope.$apply();
        };
        $scope.addRoute = function(route){
            //if(route.id === $scope.accepted.id) route.accepted = true;
            $scope.orders.push(route);
            $scope.$apply();
        };
        $scope.setAccepted = function(offer){
            $('#accepted')[0].play();
            $scope.accepted = offer;
            $scope.accepted.accepted = true;
            $scope.$apply();
            //$('.accepted-offer').slideDown(400);
        };

        function getRouteById(id){
            for(var i in $scope.orders){
                if($scope.orders[i].id === id){
                    return $scope.orders[i];
                }
            }
            return false;
        }

        $scope.methods = {
            cleanRoutes: $scope.cleanRoutes,
            addRoute: $scope.addRoute,
            setAccepted: $scope.setAccepted
        };
    })
})