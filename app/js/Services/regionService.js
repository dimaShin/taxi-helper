/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'async!googleMapsApi'], function(app){
    console.log('regionService');
    function service(){
        var regions = [
            {
                //aleevka
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.04611602786298, 36.1865618959273),
                    radius: 2800
                }),
                id: '2800:5004611602786298361865618959273'
            },{
                //p.pole - derzhprom - pushkinskaja
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.02097595718056, 36.23977510673194),
                    radius: 2300,
                }),
                id: '2300:50020975957180563623977510673194'
            },{
                //vokzal - sovetskaja - gagarina
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(49.98433188070366, 36.235318873675624),
                    radius: 2400
                }),
                id: '2400:499843318807036636235318873675624'
            },{
                //moskovskij prospekt - gagarina

                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(49.954191162294585, 36.29455086545363),
                    radius: 3900
                }),
                id:'3900:499541911622945853629455086545363'
            },{
                //severnaja saltovka
                circle: new google.maps.Circle({
                    center: new google.maps.LatLng(50.02622713306133, 36.355314594445304),
                    radius: 3300
                }),
                id:'3300:500262271330613336355314594445304'
            }
        ];

        function getRegionId(point){
            var suitedRegions = [];
            for(var i = 0; i < regions.length; i++){
                if(regions[i].circle.getBounds().contains(point)){
                    suitedRegions.push(regions[i]);
                }
            }
            if(suitedRegions.length === 1){
                console.log('regionsService: suitedRegion: ', suitedRegions[0]);
                return suitedRegions[0].id;
            }else{
                console.log('1+ suited regions');
            }
        };

        return {
            getRegionId: getRegionId
        }
    }
    app.factory('regionService', service);
});