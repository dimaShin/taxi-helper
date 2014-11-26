/**
 * Created by iashind on 18.11.14.
 */
'use strict';

define(['app', 'socket.io-client','async!googleMapsApi', 'cacheService'], function(app, socket){

    function getOrderId(order){
        return order.start.toString().replace(/\D+/g, '') + order.finish.toString().replace(/\D+/g, '');
    };
    console.log('connecting to socket: ', socket);
    var io = socket('10.11.80.112:8000');


    app.factory('operatorService', function($interval, cacheService, positioningService){
        var allOrders = [
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
            },{
                start : new google.maps.LatLng(50.01288949241843, 36.33350372314453),
                finish: new google.maps.LatLng(50.03281050661339, 36.21989607810974),
                isUrgent: false
            },{
                start : new google.maps.LatLng(50.03479526231301, 36.34535372257233),
                finish: new google.maps.LatLng(50.00073292732999, 36.26906633377075),
                isUrgent: false
            },{
                start : new google.maps.LatLng(50.028172198632475, 36.3278603553772),
                finish: new google.maps.LatLng(49.990477098342545, 36.35297656059265),
                isUrgent: false
            }
            ],
            newOrders = [],
            canceledRoutes = [];
        $interval(function getNewOrder(){
                if(allOrders.length){
                    var order = allOrders.shift();
                    createRoute(order.start, order.finish).then(
                        function success(route){
                            order.id = getOrderId(order);
                            order.route = route;
                            order.start_address = getNormalizedAddress(route.routes[0].legs[0].start_address);
                            order.end_address = getNormalizedAddress(route.routes[0].legs[0].end_address);
                            order.distance = route.routes[0].legs[0].distance.text;
                            order.price = calcPrice(route.routes[0].legs[0].distance.value, order.isUrgent);
                            newOrders.push(order);
                        }
                    );
                }
            }, 500, allOrders.length, false);
        io.on('newOrder', function(order){
            order.start = new google.maps.LatLng(order.start.lat, order.start.lng);
            order.end = new google.maps.LatLng(order.end.lat, order.end.lng),
                console.log('received new order: ', order);
            createRoute(order.start, order.end).then(
                function success(route){
                    order.route = route;
                    order.start_address = getNormalizedAddress(route.routes[0].legs[0].start_address);
                    order.end_address = getNormalizedAddress(route.routes[0].legs[0].end_address);
                    order.distance = route.routes[0].legs[0].distance.text;
                    newOrders.push(order);
                }
            );
        });
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

        function createRoute(start, finish){
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
                    console.log('routing complete: ', response);
                    deferred.resolve(response);
                }else{
                    console.log('directionsService fail: ', status);
                    deferred.reject(status);
                }
            });
            return deferred.promise();
        };

        function getBounds(radius, point){
            var deferred = $.Deferred();
            if(point){
                deferred.resolve(createCircle(point, radius).getBounds())
            }else{
                positioningService.getCurrentPos().then(
                    function success(position){
                        deferred.resolve(createCircle(position, radius).getBounds());
                    }
                )
            }
            return deferred.promise();
        }

        function createCircle(center, radius){
            return new google.maps.Circle({
                center: center,
                radius: radius
            });
        };

        function getAllOrdersInBounds(radius, point){
            var deferred = $.Deferred();
            getBounds(radius, point).then(
                function success(bounds){
                    var suitedOrders = [],
                        ordersCount = newOrders.length,
                        routesCreated = 0;
                    for(var i = 0; i < ordersCount; i++){
                        if(bounds.contains(newOrders[i].start)){
                            suitedOrders.push(newOrders[i]);
                            if(newOrders[i].route){
                                routesCreated++;
                            }else{
                                createRoute(newOrders[i].start, newOrders[i].finish).then(
                                    function success(route){
                                        var order = newOrders[i];
                                        order.route = route;
                                        order.start_address = getNormalizedAddress(route.routes[0].legs[0].start_address);
                                        order.end_address = getNormalizedAddress(route.routes[0].legs[0].end_address);
                                        order.distance = route.routes[0].legs[0].distance.text;
                                        order.price = calcPrice(route.routes[0].legs[0].distance.value, order.isUrgent);
                                        routesCreated++
                                    }
                                )
                            }
                        }
                    }
                    var waitingForRouts = $interval(function(){
                        if(routesCreated === suitedOrders.length){
                            deferred.resolve(suitedOrders);
                            $interval.cancel(waitingForRouts);
                        }
                    }, 10);
                }
            );
            return deferred.promise();
        };

        function restoreState(ordersId){
            var deferred = $.Deferred(),
                suitedOrders = [];
            for(var i = 0; i < ordersId.length; i++){
                suitedOrders.push(getOrderById(ordersId[i]));
            }
            deferred.resolve(suitedOrders);
            return deferred.promise();
        };

        function getOrderById(id){
            for(var i = 0; i < newOrders.length; i++){
                if(newOrders[i].id === id) return newOrders[i];
            }
        };

        function completeRoute(route){
            var index = newOrders.indexOf(route);
            if(index !== -1){
                newOrders.splice(index, 1);
            }
        };

        function cancelRoute(order){
            canceledRoutes.push(order.id);
        };

        return {
            cancelRoute: cancelRoute,
            completeRoute: completeRoute,
            getAllOrdersInBounds: getAllOrdersInBounds,
            getOrders: function(currentPoint, radius){
                var circle = new google.maps.Circle({
                    center: currentPoint,
                    radius: radius
                }),
                    circleBounds = circle.getBounds(),
                    suitedOrders = [];

                for(var i in newOrders){
                    if(circleBounds.contains(newOrders[i].start)){
                        newOrders[i].id = getOrderId(newOrders[i]);
                        suitedOrders.push(newOrders[i]);
                    }
                }

                return suitedOrders;
            },
            getOrderInBounds: function(bounds, driverId){
                var deferred = $.Deferred(),
                    suitedOffers = [];

                for(var i in newOrders){
                    //console.log('newOrder: ', newOrders[i].start);
                    if(bounds.contains(newOrders[i].start)){
                        if(-1 === canceledRoutes.indexOf(newOrders[i].id)){
                            suitedOffers.push(newOrders[i]);
                        }else{
                        }
                    }
                }
                if(suitedOffers.length){
                    deferred.resolve(suitedOffers);
                }else{
                    deferred.reject('no suited offers');
                }

                return deferred.promise();
            },
            restoreState: restoreState,
            getOrderById: getOrderById


        }
    });

});
