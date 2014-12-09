/**
 * Created by iashind on 09.12.14.
 */
'use strict';
define([''], function(){
    function pointOnMap(point, map){
        map.setOptions({
            draggableCursor: 'crosshair'
        });
        map.addListener('click', function(e){
            map.setOptions({
                draggableCursor: 'move'
            });
            point.$setViewValue(e.latLng.toString());
            point.$render();
            map.removeListener('click');
        });
        console.log(point, map);
    }

    return {
        pointOnMap: pointOnMap
    }

})