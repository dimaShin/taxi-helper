/**
 * Created by iashind on 12.12.14.
 */
'use strict';
define([], function(){

    function verticalSwipe(swipe){

        return{
            restrict: 'A',
            scope: {},
            link: function($scope, el, attr, ctrl){
                var posY, margTop;
                el.on('click', function(e){
                    e.preventDefault();
                });
                swipe.bind(el, {
                    start: function(e){
                        posY = e.y;
                        margTop = parseInt(el.css('marginTop'));
                    },
                    move: function(e){
                        var m = margTop - (posY - e.y);
                        el.css('marginTop', m + 'px');
                    },
                    end: function(){

                    },
                    cancel: function(){

                    }
                });
            }
        }
    }
    return verticalSwipe;
})