/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['app', 'Services/positioningService', 'Services/socketService'], function(app){
    console.log('clientController');
    function clientController($scope, socketService){
        console.log('ctrl scope:', $scope);
        $scope.visibility = {
            compiler: false,
            container: false
        };
        $scope.preOrder = {};
        $scope.orders = [];
        $scope.socketClient = socketService.getPassengerClient();
        $scope.setPreOrder = function(order){
            $scope.preOrder = order;
        };
        $scope.addOrder = function(order){
            $scope.orders.push(order);
        };

        $scope.$watchCollection(
            function ordersWatcher($scope){
                return $scope.orders;
            },
            function(newValue){
                if($scope.orders.length){
                    if(!$scope.socketClient.socket || $scope.socketClient.socket.disconnected) $scope.socketClient.connect();
                    var order = $scope.orders[$scope.orders.length -1];
                    order.basics.timestamp = new Date().getTime();
                    $scope.socketClient.socket.emit('newOrder', order.basics);
                    console.log('new order detected: ', order);
                }
            }
        )
    }

    app.controller('clientController', clientController);
});
