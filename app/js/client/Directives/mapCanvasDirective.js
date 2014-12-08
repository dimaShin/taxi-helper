/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['Constructors/mapConstructor', 'async!googleMapsApi'], function(MapConstructor){

    function mapCanvas(positioningService){

        return {
            restrict: 'EA',
            compile: function(){

                return {
                    pre: function pre($scope, el, attr, ctrl){
                        $scope.$watchCollection(
                            function screenSizeWatcher(){
                                return {
                                    width: $(window).width(),
                                    height: $(window).height()
                                }
                            },
                            function(newValue){
                                console.log('screen resized to: ', newValue);
                                //el.width(newValue.width).height(newValue.height);
                                positioningService.getCurrentPos().then(
                                    function success(currentPos){
                                        var size = {
                                            x: 40,
                                            y: 40
                                        }, image = {
                                            url: 'img/client-marker.png',
                                            size: new google.maps.Size(size.x, size.y),
                                            origin: new google.maps.Point(0, 0),
                                            anchor: new google.maps.Point(size.x / 2,size.y),
                                            scaledSize: new google.maps.Size(size.x, size.y)
                                        };
                                        $scope.map = new MapConstructor()
                                            .initialize(el[0])
                                            .addMarker(currentPos, 'clientMarker', {
                                                draggable: true,
                                                icon: image,
                                                animation: google.maps.Animation.DROP
                                            });

                                    }
                                )



                            }
                        )
                    },
                    post: function post($scope, el, attr, ctrl){

                    }

                }
            },
            controller: function($scope){
                $scope.map = {};
                $scope.initialize = function(){

                }
            }
        }
    }

    return mapCanvas;
});