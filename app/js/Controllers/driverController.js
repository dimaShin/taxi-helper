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
    }

    return driverController;
});