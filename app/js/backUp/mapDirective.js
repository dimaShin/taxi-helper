/**
 * Created by iashind on 14.11.14.
 */
'use strict';
define(['app', 'async!googleMapsApi', 'Directives/acceptedDirective'], function(app){

    var points = {
            start: new google.maps.LatLng(49.9672102, 36.3162887),
            finish: new google.maps.LatLng(50.05646369999999, 36.2008095),
            newOrders: [
                {
                    start : new google.maps.LatLng(49.980724, 36.291366),
                    finish: new google.maps.LatLng(50.02414691455807, 36.32874011993408),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(50.000473, 36.216636),
                    finish: new google.maps.LatLng(49.94913504953504, 36.17404103279114),
                    isUrgent: true
                },{
                    start : new google.maps.LatLng(49.9903421, 36.2617582),
                    finish: new google.maps.LatLng(49.972746668087865, 36.23860716819763),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(49.9932988, 36.2321288),
                    finish: new google.maps.LatLng(50.03148729057185, 36.2544322013855),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(50.03390100000001, 36.20281900000001),
                    finish: new google.maps.LatLng(50.04714989972927, 36.29039525985718),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(50.033832, 36.202457),
                    finish: new google.maps.LatLng(50.08318273729776, 36.242759227752686),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(50.007717, 36.243049),
                    finish: new google.maps.LatLng(49.98598301807259, 36.17854177951813),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(60.0140409, 30.6947599),
                    finish: new google.maps.LatLng(49.96387210085146, 36.21475696563721),
                    isUrgent: false
                },{
                    start : new google.maps.LatLng(49.9672102, 36.3162887),
                    finish: new google.maps.LatLng(49.94890032464326, 36.257516741752625),
                    isUrgent: false
                }
            ]
        };

    function getStreetFromAddress(address){
        address = address.split(',');
        address.length = 2;
        return address.toString();
    };

    function getOrderId(order){
        return order.start.toString().replace(/\D+/g, '') + order.finish.toString().replace(/\D+/g, '');
    };

    app.directive('googleMap', function(cacheService, operatorService, $interval){
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope:{
                rootMethods: '=methods'
            },
            compile: function(){
                return {
                    pre: function preLink($scope, el, attr, ctrl){
                        var width = $(window).width(),
                            height = $(window).height();
                        el.width(width).height(height);
                    },
                    post: function postLink($scope, el, attr, ctrl){
                        $scope.$on('mainCtrl:showRoute', function(e, response, isAdditional){
                            if(isAdditional){
                                var route = response.route,
                                    preRoute = response.preRoute,
                                    renderer = $scope.newRouteRenderer,
                                    preRenderer = $scope.toNewRouteRenderer;

                                $scope.renderRoute(renderer, route, {});
                                $scope.renderRoute(preRenderer, preRoute, {});
                            }else {
                                $scope.toNewRouteRenderer.setMap(null);
                                $scope.renderRoute($scope.newRouteRenderer, response, {});
                            }
                        });
                        el.addClass('map-canvas');
                        $scope.map = $scope.initializeMap(el[0]);
                        $scope.cabMarker = $scope.createMarker({
                            position: points.start,
                            title: 'driving...',
                            icon: 'img/cabs.png',
                            map: $scope.map,
                            draggable: true
                        });
                        $scope.buildRoute(points.start, points.finish).then(
                            function success(response){
                                $scope.renderRoute($scope.currentRoute, response, {});
                                $scope.mainRoute = response;
                            },
                            function error(error){
                                console.log('Fail to calc current route: ', error);
                            }
                        );
                        $interval($scope.checkOrders, 100, 0, false);
                        google.maps.event.addListener($scope.cabMarker, 'mouseup', $scope.checkOrders);
                        google.maps.event.addListener($scope.map, 'click', function(e){
                            console.log(e);
                        });
                    }
                }
            },
            controller: function($scope){
                $scope.offers = [];
                $scope.currentRoute = new google.maps.DirectionsRenderer();
                $scope.newRouteRenderer = new google.maps.DirectionsRenderer();
                $scope.newRouteRenderer.setOptions({
                    preserveViewport: true,
                    polylineOptions: {strokeColor:'#ff0'}
                });
                $scope.toNewRouteRenderer = new google.maps.DirectionsRenderer();
                $scope.toNewRouteRenderer.setOptions({
                    suppressMarkers: true,
                    preserveViewport: true,
                    polylineOptions: {strokeColor:'#f00'}
                });
                $scope.newRoute = {
                    rank: 0,
                    offer: {}
                };
                $scope.radius = 2000;

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

                $scope.buildRoute = function(start, finish, isUrgent){
                    var directionsService = new google.maps.DirectionsService(),
                        routeOptions = {
                            origin: start,
                            destination: finish,
                            travelMode: google.maps.TravelMode['DRIVING'],
                            unitSystem: google.maps.UnitSystem.METRIC
                        },
                        deferred = $.Deferred();
                    directionsService.route(routeOptions, function(response, status){
                        if(status == google.maps.DirectionsStatus.OK){
                            if(isUrgent) response.isUrgent = true;
                            deferred.resolve(response);
                        }else{
                            console.log('directionsService fail: ', status);
                            deferred.reject(status);
                        }
                    });
                    return deferred.promise();
                };

                $scope.renderRoute = function(renderer, route, options){
                    renderer.setOptions(options);
                    renderer.setMap($scope.map);
                    renderer.setDirections(route);
                };

                $scope.checkOrders = function(){
                    var cabPosition = new google.maps.LatLng(49.9672102, 36.3162887);

                    $scope.toNewRouteRenderer.setMap(null);
                    $scope.rootMethods.cleanRoutes();

                    var suitedOffers = operatorService.getOrders(cabPosition, $scope.radius);
                    $scope.eraseMarkers(suitedOffers);
                    for(var i = 0; i < suitedOffers.length; i++){
                        var newOffer = suitedOffers[i],
                            offerId = newOffer.id,
                            offer;
                        if(offer = cacheService.getOffer(offerId)){
                            $scope.completeRoute(offer);
                        }else{
                            $scope.createOffer(newOffer).then(
                                function success(offer){
                                    $scope.completeRoute(offer);
                                    cacheService.setOffer(getOrderId(offer.originals), offer);
                                },
                                function error(error){
                                    console.log('Fail to create offer, ', error);
                                }
                            );
                        }
                    }
                };

                $scope.createOffer = function(order){
                    var deferred = $.Deferred(),
                        offerDetails = {
                            originals: order
                        };

                    $scope.buildRoute($scope.cabMarker.getPosition(), order.start).then(
                        function success(preRouteResponse){
                            offerDetails.preRoute = preRouteResponse;
                            $scope.buildRoute(order.start, order.finish, order.isUrgent).then(
                                function success(routeResponse){
                                    offerDetails.route = routeResponse;
                                    deferred.resolve(offerDetails);
                                },
                                function error(error){
                                    console.log('routing error: ', error);
                                    deferred.reject(error);
                                }
                            )
                        },
                        function error(error){
                            console.log('preRouting error: ', error);
                            deferred.reject(error);
                        }
                    );
                    return deferred.promise();
                };

                $scope.eraseMarkers = function(suitedOffers){
                    for(var i in $scope.offers){
                        var isAlreadyAtMap = false;
                        for(var j in suitedOffers){
                            if($scope.offers[i].id === suitedOffers[j].id){
                                isAlreadyAtMap = true;
                                break;
                            }
                        }
                        if(isAlreadyAtMap) break;
                        $scope.offers[i].startMarker.setMap(null);
                        $scope.offers.splice(i, 1);
                    }
                    //$scope.offers.length = 0;
                };

                $scope.createMarker = function(options){
                    if(!options || !options.position) return console.log("Invalid options. Can't create marker");
                    var defOptions = {
                        position: points.start,
                        draggable: false,
                        title: 'simple marker'
                    };
                    $.extend(defOptions, options);
                    return new google.maps.Marker(defOptions);
                };

                $scope.rankOffer = function(preRoute, route, offer){
                    var rate = (offer.originals.isUrgent) ? 1.5 : 1,
                        offerRank = (route.distance.value - preRoute.distance.value) * rate;
                    if(offerRank > $scope.newRoute.rank){
                        $scope.newRoute = {
                            rank: offerRank,
                            offer: offer
                        };
                        return true;
                    }
                    return false;
                };

                $scope.calcOffer = function(offer, route){
                    var distance = route.distance.value || offer.routes[0].legs[0].distance.value,
                        rate = offer.originals.isUrgent ? 1.5 : 1;
                    if(distance < 3000) return 20;
                    return (20 + Math.ceil((distance - 3000) / 1000) * 3) * rate;
                };

                $scope.completeRoute = function(offer){
                    var route = offer.route.routes[0].legs[0],
                        preRoute = offer.preRoute.routes[0].legs[0],
                        routeModel;

                    offer.id = getOrderId(offer.originals);

                    offer.startMarker = $scope.createMarker({
                        position: route.start_location,
                        title: getStreetFromAddress(route.start_address),
                        map: $scope.map
                    });
                    google.maps.event.addListener(offer.startMarker, 'click', function(){
                        $scope.newRouteRenderer.setMap($scope.map);
                        $scope.newRouteRenderer.setDirections(offer.route);
                    });
                    $scope.offers.push(offer);
                    routeModel = {
                        id: offer.id,
                        start_address: getStreetFromAddress(route.start_address),
                        end_address: getStreetFromAddress(route.end_address),
                        preDistance: preRoute.distance.text,
                        distance: route.distance.text,
                        route: offer.route,
                        preRoute: offer.preRoute,
                        price: $scope.calcOffer(offer, route)
                    };

                    if($scope.rankOffer(preRoute, route, offer)){
                        console.log('newAccepted: ', offer.id);
                        $scope.rootMethods.setAccepted(routeModel);
                    }else{
                        if($scope.newRoute.offer.id !== routeModel.id) $scope.rootMethods.addRoute(routeModel);
                    }
                };
            }
        }
    })
});