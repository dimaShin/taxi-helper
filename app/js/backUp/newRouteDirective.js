/**
 * Created by iashind on 18.11.14.
 */
'use strict';
define(['app'], function(app){

    app.directive('newRoute', function() {
        return {
            //restrict: 'EA',
            //templateUrl: 'templates/newRoute.html',
            //scope: {
            //    routes: '=routes'
            //},
            //compile: function(){
            //    return {
            //        pre: function($scope, el, attr, ctrl){
            //            if($(window).width() < 500){
            //                el.css({
            //                    width: $(window).width() + 'px',
            //                    left: '5px'
            //                })
            //            }else {
            //                el.css({
            //                    width: '500px',
            //                    left: (($(window).width() - 500) / 2) + 'px'
            //                })
            //            }
            //        },
            //        post: function($scope, el, attr, ctrl){
            //        }
            //    }
            //},
            //controller: function($scope, $timeout){
            //
            //}
        }
    })
});