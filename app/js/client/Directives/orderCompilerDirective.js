/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define([''], function(){

    function orderCompiler(){

        return {
            restrict: 'AE',
            templateUrl: 'js/client/templates/orderCompiler.html',
            compile: function(){

                return {
                    pre: function pre($scope, el, attr, ctrl){

                    },
                    post: function post($scope, el, attr, ctrl){

                    }
                }
            },
            controller: function($scope){
                $scope.waypoints = [];
            }
        }
    }

    return orderCompiler;
});