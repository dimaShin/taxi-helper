/**
 * Created by iashind on 02.12.14.
 */
'use strict';
define(['app', 'Services/ordStatusService'], function(app){
    function orderSlctCtrl($scope, ordStatusService){
        $scope.orders = [];
        $scope.searchOrders = function(orderId){
            $scope.orders = [];
            $scope.socketClient.socket.emit('getOrder', orderId);
        };

        $scope.socketClient.socket.on('orderFound', function(order){
            order.originals.status = ordStatusService.getStatus(order.status);
            $scope.orders.push(order.originals);
            $scope.$apply();
        })

    }

    app.controller('orderSlctCtrl', orderSlctCtrl);
})