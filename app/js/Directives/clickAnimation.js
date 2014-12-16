/**
Created by iashind on 12.12.14.
 */
'use strict';
define([''], function(){
    /**
     *@function clickAnimation
     * @directive
     * @returns click-animation ng-Directive
     * holds animation on click/touch
     */
    function clickAnimation(){

        return {
            restrict: 'A',
            scope: {},
            link: function($scope, el, attr, ctrl){
                el.on('mousedown, touchstart', function(){
                    el.removeClass('animated');
                    el.one('mouseup, touchend', function(){
                        el.addClass('animated');
                    })
                })
            }
        }
    }

    return clickAnimation;
})