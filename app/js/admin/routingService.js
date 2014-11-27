/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', 'async!googleMapsApi'], function(app){
    var directionService = new google.maps.DirectionsService(),
        geocoder = new google.maps.Geocoder();
    app.factory('routingService', function($interval){
        function getLatLng(points){
            var deferred = $.Deferred(),
                pointLatLng = {
                    from: null,
                    to: null,
                    waypoints: []
                };
            for(var i in points){
                (function(i){
                    if(i === 'waypoints'){
                        for(var j = 0; j < points.waypoints.length; j++){
                            geocoder.geocode( { 'address': 'kharkov, ukraine, ' + points.waypoints[j].value}, function(results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    pointLatLng.waypoints.push({
                                        location: results[0].geometry.location,
                                        stopover: true
                                    });
                                } else {
                                    deferred.reject(status);
                                    $interval.cancel(interval);
                                }
                            });
                          }
                    }else{
                        geocoder.geocode( { 'address': 'kharkov, ukraine, ' + points[i]}, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                pointLatLng[i] = results[0].geometry.location
                            } else {
                                deferred.reject(status);
                                $interval.cancel(interval);
                            }
                        });
                    }
                })(i)
            }
            var interval = $interval(function(){
                if(pointLatLng.from && pointLatLng.to && pointLatLng.waypoints.length === points.waypoints.length){
                    deferred.resolve(pointLatLng);
                    $interval.cancel(interval);
                }
            }, 100)
            return deferred.promise();
        }

        return {
            getLatLng: getLatLng
        }
    })
})