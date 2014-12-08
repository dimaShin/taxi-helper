/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['app', 'Services/positioningService'], function(app){
    console.log('clientController');
    function clientController($scope){
        console.log('ctrl scope:', $scope);
        $scope.preOrder = {};
        $scope.orders = [];
        $scope.setPreOrder = function(order){
            $scope.preOrder = order;
        };
        $scope.addOrder = function(order){
            $scope.orders.push(order);
        };
    }

    app.controller('clientController', clientController);
});
