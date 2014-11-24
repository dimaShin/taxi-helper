/**
 * Created by iashind on 14.11.14.
 */
'use strict';

define(['app', 'cacheService'], function(app){



    app.controller('mainCtrl', function($scope){
        $scope.routes = [];
        $scope.accepted = {};
        $scope.showRoute = function(route, isAdditional){
            $scope.$broadcast('mainCtrl:showRoute', route, isAdditional);
        };
        $scope.cleanRoutes = function(){
            $scope.routes = [];
            $scope.$apply();
        };
        $scope.addRoute = function(route){
            //if(route.id === $scope.accepted.id) route.accepted = true;
            $scope.routes.push(route);
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
            for(var i in $scope.routes){
                if($scope.routes[i].id === id){
                    return $scope.routes[i];
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