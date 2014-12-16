/**
 * Created by iashind on 28.11.14.
 */
'use strict';

define(['app', 'Services/regionService', 'async!googleMapsApi'], function(app){
    /**
     *
     * @exports regionService
     * @returns {{getOrder: Function}}
     */
    function orderCreator(regionService){
        /**
         * @function initialize
         * @param {object}basics.start
         * @param {object}basics.finish
         * @param {array}basics.waypoints
         * @returns {OrderConstructor}
         * creates order from basics
         */
        OrderConstructor.prototype.initialize = function(basics){
            this.start = new google.maps.LatLng(basics.start.lat, basics.start.lng);
            this.finish = new google.maps.LatLng(basics.finish.lat, basics.finish.lng);
            this.id = getOrderId({start: this.start, finish:this.finish});
            this.basics.id = this.id;
            this.basics.region = regionService.getRegionId(this.start);
            this.basics.timestamp = basics.timestamp || new Date().getTime();
            this.basics.status = basics.status || 0;
            this.waypoints = [];
            if(basics.waypoints){
                for(var i = 0; i < basics.waypoints.length; i++){
                    var waypoint = basics.waypoints[i];
                    this.waypoints.push({
                        location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
                        stopover: true
                    })
                }
            }
            return this;
        };
        /**
         * @class OrderConstructor
         * @param basics
         * @returns {orderCreator.OrderConstructor}
         * @constructor
         */
        function OrderConstructor(basics){
            this.basics = basics;
            this.initialize(basics);
            return this;
        };
        /**
         * @function getNormalizedAddress
         * @param address
         * @returns {string}
         * remove waste address parts (ukraine, kharkov, etc.)
         */
        function getNormalizedAddress(address){
            address = address.split(',');
            address.length = 2;
            return address.toString();
        };
        /**
         * @function calcPrice
         * @param distance
         * @param isUrgent
         * @returns {number}
         * calculates order cost
         */
        function calcPrice(distance, isUrgent){
            var rate = isUrgent ? 1.5 : 1;
            distance = Math.ceil(distance / 1000);
            return (distance < 3) ? 20 * rate : 20 + (distance - 3) * 3 * rate;
        };
        /**
         * @function getOrderId
         * @param order
         * @returns {string}
         * calculates orderId
         * deprecated after DB create. Replaced with DB autoincrement index
         */
        function getOrderId(order){
            return order.start.toString().replace(/\D+/g, '') + order.finish.toString().replace(/\D+/g, '');
        };
        /**
         * @function asyncBuildRoute
         * @param {google.maps.DirectionOptions}opt
         * @returns {promise}
         * builds route for order
         */
        OrderConstructor.prototype.asyncBuildRoute = function(opt){
            var start = this.start,
                finish = this.finish,
                waypoints = this.waypoints,
                isUrgent = this.basics.isUrgent,
                order = this,
                directionsService = new google.maps.DirectionsService(),
                defOpt = {
                    origin: start,
                    destination: finish,
                    travelMode: google.maps.TravelMode['DRIVING'],
                    unitSystem: google.maps.UnitSystem.METRIC,
                    waypoints: waypoints
                },
                deferred = $.Deferred();
            if(opt) $.extend(defOpt, opt);
            directionsService.route(defOpt, function(response){
                var lastLeg = response.routes[0].legs.length - 1;
                order.route = response;
                order.start_address = getNormalizedAddress(response.routes[0].legs[0].start_address);
                order.end_address = getNormalizedAddress(response.routes[0].legs[lastLeg].end_address);
                order.distance = getRouteDistance(response.routes[0]);
                order.price = calcPrice(getRouteDistance(response.routes[0], true), isUrgent);
                order.duration = getRouteDuration(response.routes[0]);
                deferred.resolve(order);
            });
            return deferred.promise();
        };
        /**
         * @function getRouteDuration
         * @param route
         * @returns {number}
         */
        function getRouteDuration(route){
            var duration = route.legs[0].duration.value;
            for(var i = 1; i < route.legs.length; i++){
                duration += route.legs[i].duration.value;
            }
            return duration * 1000;
        }
        /**
         * @function getRouteDistance
         * @param route
         * @param isInt {Boolean}
         * @returns {number}
         */
        function getRouteDistance(route, isInt){
            var distance = route.legs[0].distance.value;
            for(var i = 1; i < route.legs.length; i++){
                distance += route.legs[i].distance.value;
            }
            if(isInt) {
                return distance;
            }else{
                return distanceText(distance);
            }
        }

        /**
         * @function distanceText
         * @param distance
         * @returns {string}
         */
        function distanceText(distance){
            return (distance / 1000).toFixed(1) + 'км';
        }

        return {
            /**
             * @function returns OrderConstructor example
             * @param basics
             * @returns {OrderConstructor}
             */
            getOrder: function(basics){
                if(basics.length){
                    var orders = [];
                    for(var i = 0; i < basics.length; i++){
                        orders.push(new OrderConstructor(basics[i]));
                    }
                    return orders;
                }
                return new OrderConstructor(basics);
            }
        }
    }


    app.factory('orderCreator', orderCreator);
});