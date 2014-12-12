/**
Created by iashind on 12.12.14.
 */
'use strict';
define([''], function(){

    function clickAnimation(){

        return {
            restrict: 'A',
            scope: {},
            link: function($scope, el, attr, ctrl){
                el.on('mousedown, touchstart', function(){
                    el.removeClass('animation');
                    el.one('mouseup, touchend', function(){
                        el.addClass('animation');
                    })
                })
            }
        }
    }

    return clickAnimation;
})