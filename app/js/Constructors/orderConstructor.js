/**
 * Created by iashind on 28.11.14.
 */
'use strict';

define(['app', 'Services/regionService', 'async!googleMapsApi'], function(app){

    function orderCreator(regionService){

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
        };

        function OrderConstructor(basics){
            this.basics = basics;
            this.initialize(basics);
            return this;
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
            return order.start.toString().replace(/\D+/g, '') + order.finish.toString().replace(/\D+/g, '');
        };

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

        function getRouteDuration(route){
            var duration = route.legs[0].duration.value;
            for(var i = 1; i < route.legs.length; i++){
                duration += route.legs[i].duration.value;
            }
            return duration * 1000;
        }

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

        function distanceText(distance){
            return (distance / 1000).toFixed(1) + 'км';
        }

        return {
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