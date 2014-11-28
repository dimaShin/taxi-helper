/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['../Services/socketService',
    'Constructors/mapConstructor',
    'Constructors/orderConstructor',
    'async!googleMapsApi'],
    function(socketService, MapConstructor, OrderConstructor){
console.log('bldController');

    var directionService = new google.maps.DirectionsService(),
        renderer = new google.maps.DirectionsRenderer();

    //io.on('connect', function(){
    //    io.emit('introduce', {driver: false});
    //});
    //console.log(io);

    function controller($scope, addressService, socketService){
        var mapCanvas = $('div#googleMap')[0],
            map,
            socketClient = socketService.getOperatorClient().connect();

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
                console.log('resize: ', newValue, oldValue);
                $(mapCanvas).width(newValue.width - 4).height(newValue.height - 4);
                map = new MapConstructor().initialize(mapCanvas);
                console.log('map: ', map);
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
                    console.log(region.getCenter());
                });
                google.maps.event.addListener(region, 'radius_changed', function(){
                    console.log(region.getRadius());
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

        function getNormalizedAddress(address){
            address = address.split(',');
            address.length = 2;
            return address.toString();
        };

        function calcPrice(distance, isUrgent){
            var rate = isUrgent ? 1.5 : 1;
            distance = Math.ceil(distance / 1000);
            return (distance < 3) ? 20 * rate : 20 + (distance - 3) * 3 * rate;
        };

        function getOrderId(order){
            return order.from.toString().replace(/\D+/g, '') + order.to.toString().replace(/\D+/g, '');
        };


        $scope.calcRoute = function(){
            renderer.setMap(null);
            $scope.order = {};
            //$scope.$apply();
            if($scope.orderOptions.$invalid) {
                console.log('invalid');
                $scope.orderDetails = 'Ошибка заполнения данных!'
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
                        new OrderConstructor(orderBasics).asyncBuildRoute().then(
                            function success(order){
                                $scope.order = order;
                                map.renderRoute(order.route);
                                $scope.orderDescribe = 'Стоимость: ' + $scope.order.price + ' грн.';
                                $scope.$apply();
                                console.log('order: ', order);
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
            socketClient.socket.emit('newOrder', $scope.order.basics);
        }

    }

    return controller;
})