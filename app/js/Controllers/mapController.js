/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function mapController($scope, operatorService, $interval, positioningService, $location, socketService){
        $scope.orders = [];
        $scope.markers= [];
        $scope.currentRoute = {};
        $scope.onTheRoute = false;
        $scope.waiting = false;
        $scope.radius = 2000;
        $scope.driverId = 'x1';
        $scope.inTheQueue = false;
        $scope.socketClient = socketService.getDriverClient();

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
                        for (var i = 0; i < $scope.orders.length; i++) {
                            routesId.push($scope.orders[i].id);
                        }
                        storageInstance = JSON.stringify({
                            routes: JSON.stringify(routesId),
                            currentRoute: ($scope.currentRoute) ? $scope.currentRoute.id : null,
                            radius: $scope.radius,
                            onTheRoute: $scope.onTheRoute,
                            inTheQueue: $scope.inTheQueue
                        });
                        sessionStorage.mapState = storageInstance;
                    };
                }
            );

            $scope.$watch(
                function queueWatcher($scope){
                    return $scope.inTheQueue;
                },
                function(newValue){
                    if(newValue){
                        positioningService.getCurrentPos().then(
                            function success(position){
                                $scope.socketClient.connect(position, $scope);
                            }
                        );
                    }else{
                        $scope.socketClient.disconnect();
                        $scope.orders = [];
                    }
                }
            );

            if(window.sessionStorage && window.sessionStorage.mapState){
                var mapState = JSON.parse(window.sessionStorage.mapState),
                    routesId = JSON.parse(mapState.routes);

                if(mapState.onTheRoute){
                    $scope.onTheRoute = true;
                    $scope.currentRoute = operatorService.getOrderById(mapState.currentRoute);
                }
                $scope.radius = mapState.radius;
                $scope.inTheQueue = mapState.inTheQueue;
                operatorService.restoreState(routesId).then(
                    function success(orders){
                        $scope.orders = $scope.orders.concat(orders);
                        $scope.markers = $scope.markers.concat(orders);
                    }
                );
            };
            //$interval(checkNewRoutes, 1000);
            $('div#mainHeader')
                .on('mousedown', function(){
                    $(this).removeClass('main-header-shadowed');
                })
                .on('mouseup', function(){
                $(this).addClass('main-header-shadowed');
            });

        })($scope);

        function checkNewRoutes(){
            getBounds().then(
                function success(bounds){
                    operatorService.getOrderInBounds(bounds, $scope.driverId).then(
                        function success(response){
                            if($scope.onTheRoute){
                                var currentRouteInResponse = response.indexOf($scope.currentRoute);
                                if(currentRouteInResponse !== -1) response.splice(currentRouteInResponse, 1);
                            }
                            $scope.orders = response;
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
            return new google.maps.Circle({
                        center: center,
                        radius: $scope.radius
                    });
        };

        function renderRoute(route){
            $scope.$broadcast('mapController:renderRoute', route);
        };

        function cancelRoute(order){
            var index = $scope.orders.indexOf(order);
            $scope.orders.splice(index, 1);
            $scope.socketClient.socket.emit('canceledOrder', order.basics);
            clearTimeout(order.timeout);
            $scope.$apply();
        };

        function completeRoute(){
            $scope.socketClient.socket.emit('competeOrder', $scope.currentRoute.basics);
            $scope.currentRoute = null;
            $scope.onTheRoute = false;

        };

        function go(order){
            if($scope.onTheRoute) completeRoute();
            clearTimeout(order.timeout);
            $scope.currentRoute = order;
            $scope.onTheRoute = true;
            for(var i = $scope.orders.length - 1; i >= 0; i--){
                if($scope.orders[i] !== order){
                    $scope.cancelRoute($scope.orders[i]);
                }
            }
            $scope.orders = [];
            order.basics.timestamp = new Date().getTime();
            $scope.socketClient.socket.emit('acceptedOrder', order.basics);
            $scope.$broadcast('mapCtrl:go');
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
