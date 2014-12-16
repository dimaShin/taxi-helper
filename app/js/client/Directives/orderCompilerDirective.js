/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['root/utils', 'Services/addressService', 'Constructors/orderConstructor'], function(utils){
    /**
     * @function orderCompiler
     * @exports addressService
     * @exports orderCreator
     * @returns {{restrict: string, templateUrl: string, compile: Function, controller: Function}}
     * receives and compiles order from user data
     */
    function orderCompiler(addressService, orderCreator){

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
                $scope.calcRoute = function(formData, waypoints){
                    $scope.orderError = undefined;
                    addressService.getLatLng({
                        from: formData.addressFrom.$viewValue,
                        to: formData.addressTo.$viewValue,
                        waypoints: waypoints
                    }).then(
                        function success(response){
                            var orderBasics = {
                                start: {
                                    lat: response.from.lat(),
                                    lng: response.from.lng()
                                },
                                finish: {
                                    lat: response.to.lat(),
                                    lng: response.to.lng()
                                },
                                isUrgent: $scope.isUrgent,
                                waypoints: []
                            };
                            for(var i = 0; i < response.waypoints.length; i++){
                                orderBasics.waypoints.push({
                                    lat: response.waypoints[i].location.lat(),
                                    lng: response.waypoints[i].location.lng()
                                });
                            }
                            orderCreator.getOrder(orderBasics).asyncBuildRoute().then(
                                function success(order){
                                    order.basics.originals = {
                                        start: formData.addressFrom.$viewValue,
                                        finish: formData.addressTo.$viewValue,
                                        waypoints: waypoints
                                    };
                                    $scope.preOrder = order;

                                    $scope.map.renderRoute(order.route);
                                    formData.$setPristine();
                                    //$scope.orderDescribe = 'Стоимость: ' + $scope.order.price + ' грн.';
                                    $scope.$apply();
                                    console.log(formData);
                                }
                            );
                        },
                        function error(status){
                            $scope.orderError = 'Ошибка составления маршрута - ' + status;
                            formData.$setPristine();
                            $scope.$apply();
                        }
                    );

                };

                $scope.pointOnMap = utils.pointOnMap;

                $scope.publicOrder = function(){
                    $scope.orders.push($scope.preOrder);
                    $scope.preOrder = {};
                    $scope.waypoints = [];
                    $scope.visibility.compiler = false;
                    console.log($scope.preOrder);
                }

            }
        }
    }

    return orderCompiler;
});