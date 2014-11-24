/**
 * Created by iashind on 17.11.14.
 */
'use strict';
define(['app', 'Services/positioningService'], function(app){

    function cacheService($cacheFactory){
        var offersCache = $cacheFactory('offers', {capacity: 15});

        return {
            setOffer: function(id, offer){
                return offersCache.put(id, offer);
            },
            getOffer: function(id){
                var result = offersCache.get(id);
               return result;
            }
        }
    }
   app.factory('cacheService', cacheService);
});