/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['Services/ordStatusService', 'Constructors/orderConstructor'], function(){

    function ordersContainer(ordStatusService, orderCreator, swipe, $filter){

        return {
            restrict: 'EA',
            templateUrl: 'js/client/templates/ordersContainer.html',
            compile: function(){

                return {
                    pre: function preLink($scope, el, attr, ctrl){

                    },
                    post: function postLink($scope, el, attr, ctrl){
                        $scope.$watchCollection(
                            function ordersWatcher($scope){
                                return $scope.orders;
                            },
                            function(newValue, oldValue){
                                if(newValue.length && newValue.length > oldValue.length){
                                    var order = newValue[newValue.length -1],
                                        status = order.basics.status || 0;
                                    console.log('new order: ', order);
                                    order.statusText = ordStatusService.getStatus(status);
                                }
                            }
                        );
                    }
                }
            },
            controller: function($scope, $sce){
                console.log('container directive: ', $scope.orders);
                $scope.updateOrder = function(order){
                    console.log('order: ', order, $scope.socketClient);
                    order.statusText = '<img src="fonts/loading-1.gif" style="width:20px;height:20px"/>';
                    $scope.updateInProgress = true;
                    $scope.socketClient.socket.emit('getOrder', order.id);
                    $scope.socketClient.socket.once('orderFound', function(updatedOrder){
                        console.log('got updated order: ', updatedOrder);
                        order.basics.status = updatedOrder.status;
                        order.statusText = ordStatusService.getStatus(updatedOrder.status);
                        if(updatedOrder.cabId || order.driver){
                            order.driver = updatedOrder.cabId;
                        }
                        order.basics.arrivalTime = updatedOrder.arrivalTime;
                        console.log('arrival Time: ', $filter('date')(order.basics.arrivalTime, 'H:m'));
                        $scope.updateInProgress = false;
                        $scope.$apply();
                    });
                };
                $scope.renderHtml = function(html_code){
                    return $sce.trustAsHtml(html_code);
                };
                $scope.showDriver = function(driverId){
                    $scope.socketClient.socket.emit('driverPosReq', driverId);
                    $scope.socketClient.socket.once('driverPosResp', function(pos){
                        var latLng = new google.maps.LatLng(pos.lat, pos.lng);
                        $scope.map.setCenter(latLng);
                        $scope.map.addMarker(latLng, driverId, {icon: 'img/cabs.png'});
                        $scope.visibility.container = $scope.visibility.compiler = false;
                        $scope.$apply();
                        console.log('got drv pos: ', pos, $scope);
                    })
                }

            }
        }

    }

    return ordersContainer;
})