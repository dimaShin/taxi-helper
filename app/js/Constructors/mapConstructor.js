/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['async!googleMapsApi'], function(){
    /**
     * @function initialize
     * @param el
     * @param opt
     * @returns {MapConstructor}
     *initialize map
     */
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
        //var map = this.map
        google.maps.event.addDomListener(window, "resize", function() {
            $(el).width($(window).width()).height($(window).height());
            console.log('window resized!!!!');
        });
        return this;
    };
    /**
     * @function setCenter
     * @param position {latLng object}
     * @param isAnimated {boolean}
     * setting center of the map
     */
    MapConstructor.prototype.setCenter = function(position, isAnimated){
        if(isAnimated){
            this.map.panTo(position);
        }else{
            this.map.setCenter(position);
        }
    }

    /**
     * @function setOptions
     * @param options{mapOptions object}
     * setting map options
     */
    MapConstructor.prototype.setOptions = function(options){
        this.map.setOptions(options);
    }

    /**
     * @function removeListener
     * @param event
     * removes map listener for specific event
     */
    MapConstructor.prototype.removeListener = function(event){
        if(this.map) google.maps.event.clearListeners(this.map, event);
    }

    /**
     * @function addListener
     * @param event
     * @param action
     * adds map listener for specific event
     */
    MapConstructor.prototype.addListener = function(event, action){
        if(this.map) google.maps.event.addListener(this.map, event, action);
    };

    /**
     * @function renderRoute
     * @param route
     * @param opt
     * @param rendererId
     * @returns {MapConstructor}
     * renders route on the map
     */
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

    /**
     * @function addMarker
     * @param latLng
     * @param id
     * @param opt
     * @returns {MapConstructor}
     * adds marker on the map
     */

    MapConstructor.prototype.addMarker = function(latLng, id, opt){
        console.log('add marker: ', id, this.map);
        var defOpt = {
            draggable: false,
            map: this.map,
            position: latLng
        };
        if(opt) $.extend(defOpt, opt);
        this.markers.push({
            id: id,
            marker: new google.maps.Marker(defOpt)
        });
        return this;
    };

    //MapConstructor.prototype.removeRoute = function(id){
    //    if(id){
    //        var route = getSmthById(id, this.renderers);
    //        route.renderer.setMap(null);
    //        this.renderers.splice(this.renderers.indexOf(route), 1);
    //    }else{
    //        this.mainRenderer.setMap(null);
    //    }
    //    return this;
    //};

    //function getSmthById(id, collection){
    //    if(collection.length){
    //        for(var i = 0; i < collection.length; i++){
    //            if(collection[i].id === id) return collection[i];
    //        }
    //    }else{
    //        for(var i in collection){
    //            if(collection.hasOwnProperty(i) && collection[i].id === id) return collection[i];
    //        }
    //    }
    //
    //}

    function MapConstructor(){
        this.renderers = [];
        this.mainRenderer = new google.maps.DirectionsRenderer();
        this.markers = [];
        return this;
    }

    return MapConstructor
});