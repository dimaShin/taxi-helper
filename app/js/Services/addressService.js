/**
 * Created by iashind on 26.11.14.
 */
'use strict';

/**
 *addressService предназначен для получения google.maps LatLng object из предоставленных пользователем текстовых данных.
 *
 *@module addressService
 *
 */
define(['app', 'async!googleMapsApi'], function(app){
    var geocoder = new google.maps.Geocoder();
    app.factory('addressService', function($interval){

 /**
 *@function getLatLng
 *@param {object} points ({object}points.start, {object}points.finish, {array}points.waypoints)
 * converts points into google maps LatLng object
 *@return promise
 */
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
                        if(points[i][0] === '('){
                            var latLng = points[i].replace(/[\(\)\s]/g, '').split(','),
                                lat = latLng[0],
                                lng = latLng[1];

                            pointLatLng[i] = new google.maps.LatLng(lat, lng);
                            console.log('lat/lng: ', pointLatLng[i]);
                        }else{
                            geocoder.geocode( { 'address': 'kharkov, ukraine, ' + points[i]}, function(results, status) {
                                if (status == google.maps.GeocoderStatus.OK && results[0].address_components.length > 5){
                                    pointLatLng[i] = results[0].geometry.location;
                                } else {
                                    deferred.reject(status);
                                    $interval.cancel(interval);
                                }
                            });
                        }

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

        function getAddress(points){

        }

        return {
            getLatLng: getLatLng,
            getAddress: getAddress
        }
    })
})