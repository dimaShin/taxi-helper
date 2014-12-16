/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){
    /**
     * @function mapController
     *
     * @exports positioningService
     * @exports $filter
     *
     * initialize and serve /map route
     */
    function mapController($scope, positioningService, $filter){
        /**
         * @function queueWatcher
         * holds queue state change connect and disconnect to the socket
         */
            $scope.$watch(
                function queueWatcher($scope){
                    return $scope.driver.inTheQueue;
                },
                function(newValue){
                    if(newValue){
                        positioningService.getCurrentPos().then(
                            function success(position){
                                if(!$scope.driver.socketClient.socket || $scope.driver.socketClient.socket.disconnected) $scope.driver.socketClient.connect(position, $scope.$parent);
                            }
                        );
                    }else{
                        $scope.driver.id = undefined;
                        $scope.driver.socketClient.disconnect();
                        $scope.driver.orders = [];
                    }
                }
            );
        /**
         * @function renderRoute
         * @fires mapController:renderRoute
         * @param route
         * tells mapDirective to render route
         */
        function renderRoute(route){
            $scope.$broadcast('mapController:renderRoute', route);
        };
        /**
         * @function cancelRoute
         * @param order
         * @fires cancelOrder
         * cancels order and returns it into order's queue
         */
        function cancelRoute(order){
            var index = $scope.driver.orders.indexOf(order);
            $scope.driver.orders.splice(index, 1);
            $scope.driver.socketClient.socket.emit('canceledOrder', order.basics);
        };
        /**
         * @function go
         * @param order
         * @fires acceptedOrder
         * accepts order and creates route to the start point. Cancels all other orders
         */
        function go(order){
            if($scope.driver.onTheRoute) completeRoute();
            $scope.driver.currentRoute = order;
            $scope.driver.socketClient.updateRegion(order.finish);
            $scope.driver.onTheRoute = true;
            for(var i = $scope.driver.orders.length - 1; i >= 0; i--){
                if($scope.driver.orders[i] !== order){
                    cancelRoute($scope.driver.orders[i]);
                }
            }
            $scope.driver.orders = [];
            order.basics.timestamp = new Date().getTime();
            order.basics.status = 1;
            positioningService.getCurrentPos().then(
                function success(currPos){
                    var routeToPassenger = {
                        origin: currPos,
                        destination: order.start,
                        travelMode: google.maps.TravelMode['DRIVING'],
                        unitSystem: google.maps.UnitSystem.METRIC
                    };
                    (new google.maps.DirectionsService).route(routeToPassenger, function(route){
                        var curTime = new Date().getTime();
                        order.basics.arrivalTime = curTime + (route.routes[0].legs[0].duration.value * 1.3 * 1000);
                        $scope.driver.socketClient.socket.emit('acceptedOrder', order.basics);
                    })
                }
            );
//            $scope.$broadcast('mapCtrl:go');
        };
        /**
         * @function completeRoute
         * @fires completeOrder
         * completes current order
         */
        function completeRoute(){
            positioningService.getCurrentPos().then(
                function success(pos){
                    $scope.driver.socketClient.updateRegion(pos);
                    $scope.driver.currentRoute.basics.arrivalTime = new Date().getTime();
                    $scope.driver.socketClient.socket.emit('completeOrder', $scope.driver.currentRoute.basics);
                    $scope.driver.currentRoute = {};
                    $scope.driver.onTheRoute = false;
                }
            )
        };
        /**
         * @function orderStatusWatcher
         * @fires updateOrderStatus
         * watches order status changes and sync it with server
         */
        $scope.$watch(
            function orderStatusWatcher($scope){
                return $scope.driver.currentRoute.basics ? $scope.driver.currentRoute.basics.status : undefined;
            },
            function(newValue, oldValue){
                if(newValue !== oldValue && $scope.driver.currentRoute.basics) {
                    var curTime = new Date().getTime();
                    /**
                     * arrivalTime for status 2 - time, when driver comes to the start point
                     * arrivalTime for status 3 - time, when driver hopes to come to the finish point
                     */
                    switch(newValue){
                        case 2: $scope.driver.currentRoute.basics.arrivalTime = curTime; break;
                        case 3: $scope.driver.currentRoute.basics.arrivalTime = curTime + $scope.driver.currentRoute.duration; break;
                    }
                    $scope.driver.socketClient.socket.emit('updateOrderStatus', $scope.driver.currentRoute.basics);
                }
            }
        );
        /**
         * methods that goes to the child isolated scopes
         * @type {{getCurrentPos: Function, renderRoute: renderRoute, cancelRoute: cancelRoute, go: go, completeRoute: completeRoute}}
         */
        $scope.methods = {
            getCurrentPos: positioningService.getCurrentPos,
            renderRoute: renderRoute,
            cancelRoute: cancelRoute,
            go: go,
            completeRoute: completeRoute
        }
        console.log('map $scope: ', $scope);
    }

    return mapController;
});
