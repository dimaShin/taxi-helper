/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){

    function routesController($scope, positioningService, operatorService, $interval){
        var loader;
        $scope.radius = 2000;
        $scope.orders = [];
        $scope.points = [
            {
                caption: 'Текущая локация',
                latLng: null
            },{
                caption: 'м. Академика Павлова',
                latLng: new google.maps.LatLng(50.009941997387, 36.31831169128418)
            },{
                caption: 'торговый центр Караван',
                latLng: new google.maps.LatLng(50.02883385688167, 36.32627248764038)
            },{
                caption: 'м. Университет',
                latLng: new google.maps.LatLng(50.004374013531006, 36.23488426208496)
            },{
                caption: 'Южный Вокзал',
                latLng: new google.maps.LatLng(49.989752831365195, 36.20651721954346)
            },{
                caption: 'торговый центр Французкий Бульвар',
                latLng: new google.maps.LatLng(49.99089785795865, 36.289944648742676)
            }
        ];
        $scope.point = $scope.points[0];
        $scope.$watchCollection(function($scope){
            return {
                point: $scope.point,
                radius: $scope.radius
            }
        }, function(newValue, oldValue){
            if(loader) $interval.cancel(loader);
            loader = $interval(function(){
                operatorService.getAllOrdersInBounds($scope.radius, $scope.point.latLng).then(
                    function success(orders){
                        for(var i = 0; i < orders.length; i++){
                            if(-1 === $scope.orders.indexOf(orders[i])){
                                $scope.orders.unshift(orders[i]);
                            }
                        }
                    }
                )
            }, 1000);
            operatorService.getAllOrdersInBounds($scope.radius, $scope.point.latLng).then(
                function success(orders){
                    $scope.orders = orders;
                }
            );
        });

        $('div#mainHeader').on('mousedown', function(){
            $(this).removeClass('main-header-shadowed');
        }).on('mouseup', function(){
            $(this).addClass('main-header-shadowed');
        });
    }


    return routesController;
});
