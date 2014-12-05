/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function mapController($scope, operatorService, $interval, positioningService, $location, socketService, orderCreator){


        (function initialize($scope){
            $scope.socketClient = socketService.getDriverClient();
            $scope.orders = [];
            $scope.currentRoute = {};
            $scope.onTheRoute = false;
            $scope.waiting = false;
            $scope.radius = 2000;
            $scope.inTheQueue = false;
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
                        var routesBasics = [], storageInstance;
                        for (var i = 0; i < $scope.orders.length; i++) {
                            routesBasics.push($scope.orders[i].basics);
                        }
                        storageInstance = JSON.stringify({
                            orders: JSON.stringify(routesBasics),
                            currentRoute: ($scope.currentRoute) ? $scope.currentRoute.basics : null,
                            radius: $scope.radius,
                            onTheRoute: $scope.onTheRoute,
                            inTheQueue: $scope.inTheQueue,
                            drvId: $scope.drvId
                        });
                        console.log('driver: ', $scope.drvId);
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
                                if(!$scope.socketClient.socket || $scope.socketClient.socket.disconnected) $scope.socketClient.connect(position, $scope);
                            }
                        );
                    }else{
                        $scope.drvId = undefined;
                        $scope.socketClient.disconnect();
                        $scope.orders = [];
                    }
                }
            );

            if(window.sessionStorage && window.sessionStorage.mapState){
                $scope.socketClient.updateScope($scope);
                var mapState = JSON.parse(window.sessionStorage.mapState),
                    ordersBasics = JSON.parse(mapState.orders);

                if(mapState.onTheRoute){
                    $scope.onTheRoute = true;
                    $scope.currentRoute = orderCreator.getOrder(mapState.currentRoute).asyncBuildRoute().then(
                        function success(order){
                            $scope.currentRoute = order;
                            $scope.$apply();
                        }
                    );
                }
                $scope.drvId = mapState.drvId;
                $scope.radius = mapState.radius;
                $scope.inTheQueue = mapState.inTheQueue;
                for(var i = 0; i < ordersBasics.length; i++){
                    var length = ordersBasics.length;
                    for(var i = 0; i < ordersBasics.length; i++){
                        orderCreator.getOrder(ordersBasics[i]).asyncBuildRoute().then(
                            function success(completeOrder){
                                $scope.orders.push(completeOrder);
                                length--;
                            }
                        )
                    }
                    var interval = setInterval(function(){
                        if(!length){
                            $scope.$apply();
                            clearInterval(interval);
                        }
                    }, 100);
                }
            }else{

            };
            $('div#mainHeader')
                .on('mousedown', function(){
                    $(this).removeClass('main-header-shadowed');
                })
                .on('mouseup', function(){
                $(this).addClass('main-header-shadowed');
            });

        })($scope);

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
            //$scope.$apply();
        };

        function completeRoute(){
            positioningService.getCurrentPos().then(
                function success(pos){
                    $scope.socketClient.updateRegion(pos);
                    $scope.socketClient.socket.emit('completeOrder', $scope.currentRoute.basics);
                    $scope.currentRoute = null;
                    $scope.onTheRoute = false;
                }
            )
        };

        function go(order){
            if($scope.onTheRoute) completeRoute();
            clearTimeout(order.timeout);
            $scope.currentRoute = order;
            console.log('order: ', order);
            $scope.socketClient.updateRegion(order.finish);
            $scope.onTheRoute = true;
            for(var i = $scope.orders.length - 1; i >= 0; i--){
                if($scope.orders[i] !== order){
                    cancelRoute($scope.orders[i]);
                }
            }
            $scope.orders = [];
            order.basics.timestamp = new Date().getTime();
            $scope.socketClient.socket.emit('acceptedOrder', order.basics);
            $scope.$broadcast('mapCtrl:go');
        };

        function arrived(order){
            order.basics.waiting = true;
            $scope.socketClient.socket.emit('driverArrived', order.basics);
        };


        $scope.methods = {
            getCurrentPos: positioningService.getCurrentPos,
            renderRoute: renderRoute,
            cancelRoute: cancelRoute,
            go: go,
            completeRoute: completeRoute,
            arrived: arrived
        }
    }

    return mapController;
});
