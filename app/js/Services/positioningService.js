/**
 * Created by iashind on 21.11.14.
 */
'use strict';
define(['app'], function(app){

    function positioningService(){

        function getCurrentPos(){
            var deferred = $.Deferred();
            deferred.resolve(new google.maps.LatLng(49.9672102, 36.3162887));
            return deferred.promise();
        };

        return {
            getCurrentPos: getCurrentPos
        }
    }

    app.factory('positioningService', positioningService);
})