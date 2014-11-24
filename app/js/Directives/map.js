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
                markers: '=',
                route: '='
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
                        var width = $(window).width(),
                            height = $(window).height();
                        el.width(width).height(height);
                    },
                    post: function postLink($scope, el, attr, ctrl){

                        function renderRoute(e, offer){
                            var route = offer.route;
                            renderedRoute = offer.id;
                            renderer.setMap($scope.map);
                            renderer.setDirections(route);
                        }

                        $scope.map = $scope.initializeMap(el[0], {zoom:13});
                        $scope.ctrlMethods.getCurrentPos().then(
                            function success(response){
                                $scope.cabMarker = new google.maps.Marker({
                                    position: response,
                                    draggable: true,
                                    map: $scope.map,
                                    icon: 'img/cabs.png'
                                });
                            }
                        );


                        google.maps.event.addListener($scope.map, 'click', function(e){
                            console.log(e);
                        });

                        $scope.$on('mapController:renderRoute', renderRoute);

                        function cleanMarkers(){
                            for(var i = markers.length - 1; i >= 0; i--){
                                markers[i].marker.setMap(null);
                            }
                            markers = [];
                        };

                        $scope.$watch(
                            function watchMarkers($scope){
                            return $scope.markers.length;
                        },
                            function(newValue, oldValue){
                                console.log('markers.length changed! ', oldValue, newValue);
                                if(oldValue === newValue && !(newValue > 0) ) return console.log('initialize: ', oldValue);
                                cleanMarkers();
                                for(var i = 0; i < $scope.markers.length; i++){
                                    var marker = new google.maps.Marker({
                                            position: $scope.markers[i].start,
                                            draggable: false,
                                            map: $scope.map
                                        });
                                        markers.push({
                                            marker: marker,
                                            id: $scope.markers[i].id,
                                            route: $scope.markers[i].route
                                        });
                                }

                                //var count = Math.max($scope.markers.length, markers.length);
                                //console.log('starting iteration :', $scope.markers, markers, ' from ', count);
                                //for(var i = count - 1; i >= 0; i--){
                                //    if(markers[i] && !isMarkerInArray(markers[i].id, $scope.markers)){
                                //        console.log('deleting marker: ', markers[i]);
                                //        markers[i].marker.setMap(null);
                                //        markers.splice(i, 1);
                                //    }
                                //    if($scope.markers[i] && !isMarkerInArray($scope.markers[i].id, markers)){
                                //        console.log('drawing marker: ', i);
                                //        var marker = new google.maps.Marker({
                                //            position: $scope.markers[i].start,
                                //            draggable: false,
                                //            map: $scope.map
                                //        });
                                //        markers.push({
                                //            marker: marker,
                                //            id: $scope.markers[i].id,
                                //            route: $scope.markers[i].route
                                //        });
                                //    }
                                //}
                            }
                        );

                        $scope.$watchCollection(
                            function watchCurrentRoute($scope){
                                return $scope.route;
                            },
                            function(newValue, oldValue){
                                console.log('current route detected: ', $scope.route);
                                if(!newValue || !newValue.id) {
                                    currentRouteRenderer.setMap(null);
                                    return
                                }

                                $scope.ctrlMethods.getCurrentPos().then(
                                    function success(position){
                                        var routeOptions = {
                                            origin: position,
                                            destination: $scope.route.route.routes[0].legs[0].end_location,
                                            travelMode: google.maps.TravelMode['DRIVING'],
                                            unitSystem: google.maps.UnitSystem.METRIC,
                                            waypoints: [
                                                {
                                                    location: $scope.route.route.routes[0].legs[0].start_location,
                                                    stopover: true
                                                }
                                            ]
                                        };
                                        directionsService.route(routeOptions, function(response, status){
                                            if(status == google.maps.DirectionsStatus.OK){
                                                currentRouteRenderer.setMap($scope.map);
                                                currentRouteRenderer.setDirections(response);
                                            }
                                        })
                                    }
                                )
                            }
                        )


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
            }
        }
    }

    return mapDirective;

})