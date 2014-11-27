/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['async!googleMapsApi'], function(){
    MapConstructor.prototype.initialize = function(el, opt){
        var defOpt = {
            zoom: 14,
            center: new google.maps.LatLng(49.9672102, 36.3162887),
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false
        };
        if(opt) $.extend(defOpt, opt);
        this.map = new google.maps.Map(el , defOpt);
        return this;
    };

    MapConstructor.prototype.renderRoute = function(route, opt, rendererId){
        var renderer;
        if(rendererId) {
            renderer = new google.maps.DirectionsRenderer();
            this.renderers.push({
                id: rendererId,
                renderer: renderer
            });
        }else{
            renderer = this.mainRenderer;
        }
        if(opt){
            renderer.setOptions(opt);
        }
        renderer.setMap(this.map);
        renderer.setDirections(route);
        return this;
    };

    MapConstructor.prototype.addMarker = function(latLng, id, opt){
        var defOpt = {
            draggable: false,
            map: this.map,
            center: latLng
        };
        if(opt) $.extend(defOpt, opt);
        this.markers.push({
            id: id,
            marker: new google.maps.Marker(defOpt)
        });
        return this;
    };

    MapConstructor.prototype.removeRoute = function(id){
        if(id){
            var route = getSmthById(id, this.renderers);
            route.renderer.setMap(null);
            this.renderers.splice(this.renderers.indexOf(route), 1);
        }else{
            this.mainRenderer.setMap(null);
        }
    };

    function getSmthById(id, collection){
        for(var i = 0; i < collection.length; i++){
            if(collection[i].id === id) return collection[i];
        }
    }

    function MapConstructor(){
        this.renderers = [];
        this.mainRenderer = new google.maps.DirectionsRenderer();
        this.markers = [];
        return this;
    }

    return MapConstructor
});