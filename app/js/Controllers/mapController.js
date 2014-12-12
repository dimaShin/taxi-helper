/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function mapController($scope, operatorService, $interval, positioningService, $location, socketService, orderCreator, $filter){

        console.log('initialize: ', $scope.driver);

            $scope.$watch(
                function queueWatcher($scope){
                    return $scope.driver.inTheQueue;
                },
                function(newValue){

                    //$scope.$parent.inTheQueue = newValue;
                    //console.log('inTheQueue: ', $scope, $scope.$parent);
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

            $('div#mainHeader')
                .on('mousedown', function(){
                    $(this).removeClass('main-header-shadowed');
                })
                .on('mouseup', function(){
                $(this).addClass('main-header-shadowed');
            });

        function renderRoute(route){
            $scope.$broadcast('mapController:renderRoute', route);
        };

        function cancelRoute(order){
            var index = $scope.driver.orders.indexOf(order);
            $scope.driver.orders.splice(index, 1);
            $scope.driver.socketClient.socket.emit('canceledOrder', order.basics);
            //clearTimeout(order.timeout);
            //$scope.$apply();
        };

        function go(order){
            if($scope.driver.onTheRoute) completeRoute();
            //clearTimeout(order.timeout);
            $scope.driver.currentRoute = order;
            console.log('order: ', order);
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
                    (new google.maps.DirectionsService).route(routeToPassenger, function(route, status){
                        var curTime = new Date().getTime();
                        order.basics.arrivalTime = curTime + (route.routes[0].legs[0].duration.value * 1.3 * 1000);
                        $scope.driver.socketClient.socket.emit('acceptedOrder', order.basics);
                    })
                }
            )



            $scope.$broadcast('mapCtrl:go');
        };

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

        function arrived(order){
            order.basics.waiting = true;
            $scope.driver.socketClient.socket.emit('driverArrived', order.basics);
        };

        $scope.$watch(
            function orderStatusWatcher($scope){
                return $scope.driver.currentRoute.basics ? $scope.driver.currentRoute.basics.status : undefined;
            },
            function(newValue, oldValue){
                console.log('status changed: ', newValue, oldValue);
                if(newValue !== oldValue && $scope.driver.currentRoute.basics) {
                    var curTime = new Date().getTime(), arTime;
                    switch(newValue){
                        case 2: arTime = curTime; break;
                        case 3: arTime = curTime + $scope.driver.currentRoute.duration; break;
                    }
                    var arTimeFormatted = $filter('date')(arTime, 'H:m');
                    console.log('arTime: ', arTimeFormatted);
                    $scope.driver.currentRoute.basics.arrivalTime = arTime;
                    $scope.driver.socketClient.socket.emit('updateOrderStatus', $scope.driver.currentRoute.basics);
                    console.log('status: ', $scope.driver.currentRoute.basics);
                }
            }
        );

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
