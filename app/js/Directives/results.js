/**
 * Created by iashind on 21.11.14.
 */
define([''], function(){
    function resultsDirective(){

        return {
            restrict: 'EA',
            templateUrl: 'templates/results.html',
            scope: {
                orders: '='
            },
            controller: function($scope){
            },
            compile: function(){

                return{
                    pre: function($scope, el, attr, ctrl){

                    },
                    post: function($scope, el, attr, ctrl){

                    }
                }

            }
        }
    }

    return resultsDirective;
})