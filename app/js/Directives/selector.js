/**
 * Created by iashind on 21.11.14.
 */
define(['jqueryUI-touch'], function(){

    function selectorDirective(){
        return {
            restrict: 'EA',
            templateUrl: 'templates/selector.html',
            scope: {
                radius: '=radius',
                point: '=point',
                points: '='
            },
            controller: function($scope) {

            },
            compile: function(){

                return{
                    pre: function($scope, el, attr, ctrl){

                    },
                    post: function($scope, el, attr, ctrl){
                        $('div#slider').slider({
                            min: 500,
                            max: 5000,
                            step: 500,
                            value: 2000,
                            slide: function(e, ui){
                                $scope.radius = ui.value;
                                $scope.$apply();
                            }
                        })
                    }
                }

            }
        }
    }

    return selectorDirective
})