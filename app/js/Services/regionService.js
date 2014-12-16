/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'async!googleMapsApi'],
    /**
     * @module regionService
     * holds map regions
     * @param app
     */
function(app){
    function service(){
        /**
         * @array of regions
         * @type {{circle: google.maps.Circle, id: string, name: string, radius: number}[]}
         */
        var regions = [
            {
                //aleevka
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.04611602786298, 36.1865618959273),
                    radius: 2800
                }),
                id: '2800:5004611602786298361865618959273',
                name: 'Алексеевка',
                radius: 2800
            },{
                //p.pole - derzhprom - pushkinskaja
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.02097595718056, 36.23977510673194),
                    radius: 2300
                }),
                id: '2300:50020975957180563623977510673194',
                name: 'Павлово Поле - Держпром - Пушкинская',
                radius: 2300
            },{
                //vokzal - sovetskaja - gagarina
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(49.98433188070366, 36.235318873675624),
                    radius: 2400
                }),
                id: '2400:499843318807036636235318873675624',
                name: 'Вокзал - м. Советская - м. Гагарина',
                radius: 2400
            },{
                //moskovskij prospekt - gagarina

                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(49.954191162294585, 36.29455086545363),
                    radius: 3900
                }),
                id:'3900:499541911622945853629455086545363',
                name: 'пр. Московский - пр. Гагарина',
                radius: 3900
            },{
                //severnaja saltovka
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.02622713306133, 36.355314594445304),
                    radius: 3300
                }),
                id:'3300:500262271330613336355314594445304',
                name: 'м. Героев Труда',
                radius: 3300
            }
        ];


        /**
         * @function getRegionId
         * @param point
         * @returns {regionId}
         * computes nearest region to the point
         */
        function getRegionId(point){
            var suitedRegions = [];
            for(var i = 0; i < regions.length; i++){
                if(regions[i].circle.getBounds().contains(point)){
                    suitedRegions.push(regions[i]);
                }
            }
            if(suitedRegions.length === 1){
                return suitedRegions[0].id;
            }else{
                var nearest = {
                        distance: Infinity,
                        regionId: null
                    },
                    pointLat = point.lat(),
                    pointLng = point.lng();
                for(var i = 0; i < suitedRegions.length; i++){
                    var center = suitedRegions[i].circle.getCenter(),
                        centerLat = center.lat(),
                        centerLng = center.lng(),
                        distance = Math.abs(centerLat - pointLat) + Math.abs(centerLng - pointLng);
                    if(distance < nearest.distance){
                        nearest = {
                            distance: distance,
                            regionId: suitedRegions[i].id
                        }
                    }
                }
                return nearest.regionId;
            }
        };

        function getAllRegions(){
            return regions;
        }

        return {
            getRegionId: getRegionId,
            getAllRegions: getAllRegions
        }
    }
    app.factory('regionService', service);
});