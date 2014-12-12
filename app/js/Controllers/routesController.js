/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function routesController($scope, positioningService, operatorService, $interval, regionService, socketService){
        $scope.radius = 2000;
        $scope.orders = [];
        $scope.points = regionService.getAllRegions();
        $scope.point = $scope.points[0];
        $scope.$watchCollection(function($scope){
            return {
                point: $scope.point,
                radius: $scope.radius
            }
        }, function(newValue, oldValue){
            //ToDo не появляются заказы, которые в данный момент на странице "новые заказы"
            //ToDo по истичению таймаута не изчезает заказ если открыт роут "все маршруты"
            console.log('region changed: ', $scope.point, $scope);
            $scope.orders = [];
            socketService.getDriverClient().getOrdersInRegion($scope.point.id, $scope);
        });

        $('div#mainHeader').on('mousedown', function(){
            $(this).removeClass('main-header-shadowed');
        }).on('mouseup', function(){
            $(this).addClass('main-header-shadowed');
        });
    }


    return routesController;
});
