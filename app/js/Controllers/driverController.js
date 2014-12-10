/**
 * Created by iashind on 08.12.14.
 */
'use strict';

define([], function(){

    function driverController($scope, operatorService, $interval, positioningService, $location, socketService, orderCreator) {

        $scope.driver = {
            orders: [],
            currentRoute: [],
            socketClient: socketService.getDriverClient(),
            radius: 2000,
            id: undefined,
            onTheRoute: false,
            waiting: false,
            inTheQueue: false
        };
        //var driverTimeOut = 5000;
        //$scope.$watchCollection(
        //    function ordersWatcher($scope){
        //        return $scope.driver.orders;
        //    },
        //    function(newValue, oldValue){
        //        console.log('orders changed');
        //        for(var i = 0; i < newValue.length; i++){
        //            if(!newValue[i].timeout){
        //                (function(order){
        //                    order.timeout = setTimeout(function(){
        //                        console.log('timeout expired, canceling order');
        //                        $scope.mapCtrl.cancelRoute(order);
        //                    }, driverTimeOut)
        //                })(newValue[i])
        //            }
        //        }
        //    }
        //);
    }

    return driverController;
});