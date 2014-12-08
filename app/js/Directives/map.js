/**
 * Created by iashind on 19.11.14.
 */
'use strict';

define(['angular', 'async!googleMapsApi'], function(){
    function mapDirective(){
        var markers = [];
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope:{
                ctrlMethods: '=methods',
                orders: '=',
                route: '=',
                size: '='
            },
            compile: function(){
                var renderer = new google.maps.DirectionsRenderer(),
                    renderedRoute,
                    currentRouteRenderer = new google.maps.DirectionsRenderer(),
                    directionsService = new google.maps.DirectionsService();
                renderer.setOptions({
                    preserveViewport: false,
                    polylineOptions: {strokeColor:'#ff0'}
                });
                return {
                    pre: function preLink($scope, el, attr, ctrl){
                        $scope.$watchCollection(
                            function screenSizeWatcher(){
                                return {
                                    width: $(window).width(),
                                    height: $(window).height()
                                }
                            },
                            function(newValue){
                                console.log('fitting map: ', newValue);
                                //el.height(newValue.height).width(newValue.width);
                                $scope.map = $scope.initializeMap(el[0], {zoom:13});
                                google.maps.event.addListener($scope.map, 'click', function(e){
                                    console.log(e);
                                });
                                $scope.ctrlMethods.getCurrentPos().then(
                                    function success(position){
                                        $scope.cabMarker = new google.maps.Marker({
                                            position: position,
                                            draggable: true,
                                            map: $scope.map,
                                            icon: 'img/cabs.png'
                                        });
                                        if($scope.route.id){
                                            $scope.renderCurrentRoute(currentRouteRenderer, directionsService, position);
                                        }
                                    }
                                );
                            }
                        );
                    },
                    post: function postLink($scope, el, attr, ctrl){

                        function renderRoute(e, offer){
                            var route = offer.route;
                            renderedRoute = offer.id;
                            renderer.setMap($scope.map);
                            renderer.setDirections(route);
                        }
                        $scope.$on('mapController:renderRoute', renderRoute);
                        $scope.$on('mapCtrl:go', function(){
                            renderer.setMap(null);
                        });

                        function cleanMarkers(){
                            for(var i = markers.length - 1; i >= 0; i--){
                                markers[i].marker.setMap(null);
                            }
                            markers = [];
                        };

                        $scope.$watch(
                            function watchMarkers($scope){
                                return $scope.orders.length;
                        },
                            function(newValue, oldValue){
                                if(oldValue === newValue && !(newValue > 0) ) return console.log('initialize markers watcher: ', oldValue);
                                cleanMarkers();
                                for(var i = 0; i < $scope.orders.length; i++){
                                    var marker = new google.maps.Marker({
                                            position: $scope.orders[i].start,
                                            draggable: false,
                                            map: $scope.map
                                        });
                                        markers.push({
                                            marker: marker,
                                            id: $scope.orders[i].id,
                                            route: $scope.orders[i].route
                                        });
                                }

                            }
                        );

                        $scope.$watchCollection(
                            function watchCurrentRoute($scope){
                                return $scope.route;
                            },
                            function(newValue, oldValue){
                                console.log('map directive: $scope.route', newValue, oldValue);
                                if(!newValue || !newValue.id) {
                                    console.log('removing route from map: ', newValue);
                                    currentRouteRenderer.setMap(null);
                                    return
                                }
                                console.log('start rendering route');
                                $scope.ctrlMethods.getCurrentPos().then(
                                    function success(position){
                                        $scope.renderCurrentRoute(currentRouteRenderer, directionsService, position);
                                    }
                                )
                            }
                        );


                    }
                }

            },
            controller: function($scope){

                $scope.initializeMap = function(el, options){
                    var defOptions = {
                        zoom: 14,
                        center: new google.maps.LatLng(49.9672102, 36.3162887),
                        panControl: false,
                        zoomControl: false,
                        mapTypeControl: false,
                        scaleControl: false,
                        streetViewControl: false,
                        overviewMapControl: false
                    };
                    if(options) $.extend(defOptions, options);
                    return new google.maps.Map(el , defOptions);
                };

                $scope.renderCurrentRoute = function(currentRouteRenderer, directionsService, position){
                    console.log('got current position: ', $scope.route.route);
                    var legs = $scope.route.route.routes[0].legs;
                    var destination = legs[legs.length - 1].end_location,
                        waypoints = [];
                    for(var i = 0; i < legs.length; i++){
                        waypoints.push({
                            location: legs[i].start_location,
                            stopover: true
                        })
                    }
                    var routeOptions = {
                        origin: position,
                        destination: destination,
                        travelMode: google.maps.TravelMode['DRIVING'],
                        unitSystem: google.maps.UnitSystem.METRIC,
                        waypoints: waypoints
                    };
                    directionsService.route(routeOptions, function(response, status){
                        console.log('rendering');
                        if(status == google.maps.DirectionsStatus.OK){
                            currentRouteRenderer.setMap($scope.map);
                            currentRouteRenderer.setDirections(response);
                        }
                    })
                }
            }
        }
    }

    return mapDirective;

})