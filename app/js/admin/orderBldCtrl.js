/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['socket.io-client', 'async!googleMapsApi'], function(socket){
console.log('bldController');

    var directionService = new google.maps.DirectionsService(),
        renderer = new google.maps.DirectionsRenderer(),
        io = socket();
    io.on('connect', function(){
        io.emit('introduce', {driver: false});
    });
    console.log(io);

    function controller($scope, routingService, regionService){
        var mapCanvas = $('div#googleMap')[0],
            map;

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
                map = initializeMap(mapCanvas);
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
            $scope.$apply();
            if($scope.orderOptions.$invalid) {
                console.log('invalid');
                $scope.orderDetails = 'Ошибка заполнения данных!'
            }else{
                console.log('rService: ', routingService)
                routingService.getLatLng({
                    from: $scope.orderOptions.addressFrom.$viewValue,
                    to: $scope.orderOptions.addressTo.$viewValue,
                    waypoints: $scope.waypoints
                }).then(
                    function success(response){
                        var routeOptions = {
                            origin: response.from,
                            destination: response.to,
                            travelMode: google.maps.TravelMode['DRIVING'],
                            unitSystem: google.maps.UnitSystem.METRIC,
                            waypoints: response.waypoints

                        };
                        directionService.route(routeOptions, function(route, status){
                            $scope.order = {
                                id: getOrderId(response),
                                start: {
                                    lat: response.from.lat(),
                                    lng: response.from.lng()
                                },
                                end: {
                                    lat: response.to.lat(),
                                    lng: response.to.lng()
                                },
                                price: calcPrice(route.routes[0].legs[0].distance.value, $scope.isUrgent),
                                isUrgent: $scope.isUrgent,
                                waypoints: response.waypoints,
                                region: regionService.getRegionId(response.from)
                            };
                            $scope.orderDetails = 'Стоимость: ' + $scope.order.price + ' грн.';
                            renderer.setMap(map);
                            renderer.setDirections(route);
                            $scope.$apply();
                            console.log('order: ', $scope.order);
                        });
                        console.log('orderBldCtrl received points ', response);
                    },
                    function error(status){
                        $scope.orderDetails = 'Ошибка составления маршрута - ' + status;
                        $scope.$apply();
                    }
                )
            }
        };

        $scope.publicOrder = function(){
            io.emit('newOrder', $scope.order);
        }

    }

    return controller;
})