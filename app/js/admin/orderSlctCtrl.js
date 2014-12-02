/**
 * Created by iashind on 02.12.14.
 */
'use strict';
define(['app'], function(app){
    function orderSlctCtrl($scope){
        console.log('selectCtrl: ', $scope);
        $scope.orders = [];
        $scope.searchOrders = function(orderId){
            console.log('search for: ', orderId);
            $scope.socketClient.socket.emit('getOrder', orderId);
        };

        $scope.socketClient.socket.on('foundOrder', function(order){
            console.log('found order: ', $scope.orders);
            $scope.orders.push(order);
            $scope.$apply();
        })

    }

    app.controller('orderSlctCtrl', orderSlctCtrl);
})