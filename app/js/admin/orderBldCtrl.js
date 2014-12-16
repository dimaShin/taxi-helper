/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', 'Services/socketService',
    'Constructors/mapConstructor',
    'Constructors/orderConstructor',
    'Services/addressService',
    'async!googleMapsApi'],
    /**
     * @function orderBldCtrl
     * @export app
     * @export socketService
     * @export MapConstructor
     */
    function(app, socketService, MapConstructor){

    var renderer = new google.maps.DirectionsRenderer();

    function controller($scope, addressService, socketService, orderCreator){
        var mapCanvas = $('div#googleMap')[0],
            socketClient = socketService.getOperatorClient().connect();
        $scope.socketClient = socketClient; //ToDo socketClient rename to $scope.SocketClient
        $scope.waypoints = [];
        $scope.orderDetails = '';
        $scope.order = {};

        $scope.addressFrom = 'Московский 142';
        $scope.addressTo = 'сумская 1';
        $scope.$watchCollection(
            function windowResize(){
                return {
                    width: $(window).width(),
                    height: $(window).height()
                }
            },
            function(newValue){
                $(mapCanvas).width(newValue.width - 4).height(newValue.height - 4);
                $scope.map = new MapConstructor().initialize(mapCanvas);
            }
        );

        $scope.calcRoute = function(){
            renderer.setMap(null);
            $scope.order = {};
            if($scope.orderOptions.$invalid) {
                $scope.orderDetails = 'Ошибка заполнения данных!'
            }else if(0){
            }else{
                addressService.getLatLng({
                    from: $scope.orderOptions.addressFrom.$viewValue,
                    to: $scope.orderOptions.addressTo.$viewValue,
                    waypoints: $scope.waypoints
                }).then(
                    function success(response){
                        var orderBasics = {
                            start: {
                                lat: response.from.lat(),
                                lng: response.from.lng()
                            },
                            finish: {
                                lat: response.to.lat(),
                                lng: response.to.lng()
                            },
                            isUrgent: $scope.isUrgent,
                            waypoints: []
                        };
                        for(var i = 0; i < response.waypoints.length; i++){
                            orderBasics.waypoints.push({
                                lat: response.waypoints[i].location.lat(),
                                lng: response.waypoints[i].location.lng()
                            });
                        }
                        orderCreator.getOrder(orderBasics).asyncBuildRoute().then(
                            function success(order){
                                order.basics.originals = {
                                    start: $scope.orderOptions.addressFrom.$viewValue,
                                    finish: $scope.orderOptions.addressTo.$viewValue,
                                    waypoints: $scope.waypoints
                                };
                                $scope.order = order;

                                $scope.map.renderRoute(order.route);
                                $scope.orderDescribe = 'Стоимость: ' + $scope.order.price + ' грн.';
                                $scope.$apply();
                            }
                        );
                    },
                    function error(status){
                        $scope.orderDescribe = 'Ошибка составления маршрута - ' + status;
                        $scope.$apply();
                    }
                )
            }
        };

        $scope.publicOrder = function(){
            $scope.order.basics.timestamp = new Date().getTime();
            socketClient.socket.emit('newOrder', $scope.order.basics);
        };

        $scope.pointOnMap = function(point, map){
            map.setOptions({
                draggableCursor: 'crosshair'
            });
            map.addListener('click', function(e){
                map.setOptions({
                    draggableCursor: 'move'
                });
                $scope[point.$name] = e.latLng.toString();
                console.log('name: ', point.$name, $scope[point.$name]);
                point.$setViewValue(e.latLng.toString());
                point.$render();
                map.removeListener('click');
            });
            console.log(point, map);
        }

    }

    app.controller('orderBldCtrl', controller);
})