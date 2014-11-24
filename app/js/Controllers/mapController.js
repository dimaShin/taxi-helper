/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function mapController($scope, operatorService, $interval, positioningService, $location){
        $scope.routes = [];
        $scope.markers= [];
        $scope.currentRoute = {};
        $scope.onTheRoute = false;
        $scope.radius = 2000;
        $scope.driverId = 'x1';

        (function initialize($scope){
            $scope.$watch(
                function locationWatcher(){
                    return $location.path();
                },
                function(newValue, oldValue) {
                    if (newValue === oldValue) return;
                    if (window.sessionStorage && JSON) {
                        if(!sessionStorage.mapState){
                            $(window).on('unload', function cleanSessionStorage() {
                                sessionStorage.removeItem('mapState');
                            });
                        }
                        var routesId = [], storageInstance;
                        for (var i = 0; i < $scope.routes.length; i++) {
                            routesId.push($scope.routes[i].id);
                        }
                        storageInstance = JSON.stringify({
                            routes: JSON.stringify(routesId),
                            currentRoute: ($scope.currentRoute) ? $scope.currentRoute.id : null,
                            radius: $scope.radius,
                            onTheRoute: $scope.onTheRoute
                        });
                        sessionStorage.mapState = storageInstance;
                    };
                }
            );

            if(window.sessionStorage && window.sessionStorage.mapState){
                var mapState = JSON.parse(window.sessionStorage.mapState),
                    routesId = JSON.parse(mapState.routes);

                if(mapState.onTheRoute){
                    $scope.onTheRoute = true;
                    $scope.currentRoute = operatorService.getOrderById(mapState.currentRoute);
                    //$scope.$apply();
                }
                $scope.radius = mapState.radius;
                operatorService.restoreState(routesId).then(
                    function success(orders){
                        $scope.routes = $scope.routes.concat(orders);
                        $scope.markers = $scope.markers.concat(orders);

                        $scope.$apply();
                    }
                );
            };
            console.log('check new routes: ', checkNewRoutes);
            $interval(checkNewRoutes, 1000);
            $('div#mainHeader').on('mousedown', function(){
                $(this).removeClass('main-header-shadowed');
            }).on('mouseup', function(){
                $(this).addClass('main-header-shadowed');
            });
        })($scope);

        function checkNewRoutes(){
            console.log('checking for new routes: ');
            getBounds().then(
                function success(bounds){
                    //eraseOutBoundsRoutes(bounds);
                    operatorService.getOrderInBounds(bounds, $scope.driverId).then(
                        function success(response){
                            //response.start_address = getNormalizedAddress(response.route.routes[0].legs[0].start_address);
                            //response.end_address = getNormalizedAddress(response.route.routes[0].legs[0].end_address);
                            //response.distance = response.route.routes[0].legs[0].distance.text;
                            //response.price = calcPrice(response.route.routes[0].legs[0].distance.value, response.isUrgent);
                            if($scope.onTheRoute){
                                var currentRouteInResponse = response.indexOf($scope.currentRoute);
                                if(currentRouteInResponse !== -1) response.splice(currentRouteInResponse, 1);
                            }
                            $scope.routes = response;
                            $scope.markers = response;
                            $('audio#incomingBell')[0].play();
                        },
                        function error(){
                        }
                    );
                }
            );
        };

        function getBounds(){
            var deferred = $.Deferred();
            if($scope.onTheRoute){
                deferred.resolve(createCircle($scope.currentRoute.finish).getBounds());
            }else{
                positioningService.getCurrentPos().then(
                    function success(response){
                        deferred.resolve(createCircle(response).getBounds());
                    }
                )
            }
            return deferred.promise();
        };

        function createCircle(center){
            var circle = new google.maps.Circle({
                        center: center,
                        radius: $scope.radius
                    });
            return circle;
        };

        function getNormalizedAddress(address){
            address = address.split(',');
            address.length = 2;
            return address.toString();
        };

        function calcPrice(distance, isUrgent){
            var rate = isUrgent ? 1.5 : 1;
            distance = Math.ceil(distance / 1000);
            return (distance < 3) ? 20 * rate : 20 + (distance - 3) * 3 * rate;
        };

        function eraseOutBoundsRoutes(bounds){
            for(var i = 0; i < $scope.routes.length; i++){
                if(!bounds.contains($scope.routes[i].start)){
                    $scope.routes.splice(i, 1);
                    $scope.markers.splice(i, 1);
                }
            }
        };

        function renderRoute(route){
            $scope.$broadcast('mapController:renderRoute', route);
        };

        function cancelRoute(route){
            var index = $scope.routes.indexOf(route);

            $scope.routes.splice(index, 1);
            $scope.markers.splice(index, 1);
            console.log('route canceled');
            //$scope.$broadcast('mapController:cancelRoute', route);
        };

        function completeRoute(){
            operatorService.completeRoute($scope.currentRoute);
            $scope.currentRoute = null;
            $scope.onTheRoute = false;

        };

        function go(route){
            if($scope.onTheRoute) completeRoute();
            $scope.currentRoute = route;
            $scope.onTheRoute = true;
            $scope.routes = [];
            $scope.markers = [];
        };


        $scope.methods = {
            getCurrentPos: positioningService.getCurrentPos,
            renderRoute: renderRoute,
            cancelRoute: cancelRoute,
            go: go,
            completeRoute: completeRoute
        }
    }

    return mapController;
});
