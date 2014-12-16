//Created by iashind on 21.11.14.
'use strict';

define(['app', 'Services/regionService', 'Services/socketService'],
    /**
     * @module positioningService
     * gets Current gps positioning
     * @param app
     */
    function(app){

    function positioningService(){
        /**
         * @function getCurrentPositioning
         * async gets current positioning
         * @returns {promise}
         */
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