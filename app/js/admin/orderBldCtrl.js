/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', 'Services/socketService',
    'Constructors/mapConstructor',
    'Constructors/orderConstructor',
    'addressService',
    'async!googleMapsApi'],
    function(app, socketService, MapConstructor){

    var directionService = new google.maps.DirectionsService(),
        renderer = new google.maps.DirectionsRenderer();

    //io.on('connect', function(){
    //    io.emit('introduce', {driver: false});
    //});
    //console.log(io);

    function controller($scope, addressService, socketService, orderCreator){
        var mapCanvas = $('div#googleMap')[0],
            map,
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
            function(newValue, oldValue){
                $(mapCanvas).width(newValue.width - 4).height(newValue.height - 4);
                map = new MapConstructor().initialize(mapCanvas);
                //map = initializeMap(mapCanvas);
            }
        );
        function initializeMap(el, options){
            var defOptions = {
                zoom: 14,
                center: new google.maps.LatLng(49.9672102, 36.3162887),
                panControl: false,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                overviewMapControl: false
                }, map;
            if(options) $.extend(defOptions, options);
            map = new google.maps.Map(el , defOptions);
            google.maps.event.addListener(map, 'click', function(e){
                var region = createRegion(e.latLng, 3000);
                region.setMap(map);
                google.maps.event.addListener(region, 'dragend', function(){
                });
                google.maps.event.addListener(region, 'radius_changed', function(){
                });
            });
            return map;
        };

        function createRegion(center, radius){
            return new google.maps.Circle({
                center: center,
                radius: radius,
                draggable: true,
                editable: true
            });
        };

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

                                map.renderRoute(order.route);
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

            socketClient.socket.once('message', function(message){
            })

        };

        $scope.pointOnMap = function(point){
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
    //return controller;
})