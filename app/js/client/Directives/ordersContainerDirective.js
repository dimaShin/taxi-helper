/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['Services/ordStatusService', 'Constructors/orderConstructor'], function(){

    function ordersContainer(ordStatusService, orderCreator, swipe){

        return {
            restrict: 'EA',
            templateUrl: 'js/client/templates/ordersContainer.html',
            compile: function(){

                return {
                    pre: function preLink($scope, el, attr, ctrl){

                    },
                    post: function postLink($scope, el, attr, ctrl){
                        var slider = $('ul.orders-list-container'),
                            posY, margTop;

                        $('div.shadowed').on('mousedown', function(){
                            $(this).removeClass('shadowed').on('mouseup', function(){
                                $(this).addClass('shadowed');
                            })
                        });
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
                        swipe.bind(slider, {
                            start: function(e){
                                posY = e.y;
                                margTop = parseInt(slider.css('marginTop'));
                                console.log('start: ', posY, margTop);
                            },
                            move: function(e){
                                console.log('moving!', slider);
                                var m = margTop - (posY - e.y);
                                console.log('move! margin: ', m);
                                slider.css('marginTop', m + 'px');

                            },
                            end: function(){

                            },
                            cancel: function(){

                            }
                        });
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
                    $scope.socketClient.socket.on('orderFound', function(updatedOrder){
                        console.log('got updated order: ', updatedOrder);
                        order.statusText = ordStatusService.getStatus(updatedOrder.status);
                        if(updatedOrder.cabId || order.driver){
                            order.driver = updatedOrder.cabId;
                        }
                        $scope.updateInProgress = false;
                        $scope.$apply();
                    });
                };
                $scope.renderHtml = function(html_code){
                    return $sce.trustAsHtml(html_code);
                };
            }
        }

    }

    return ordersContainer;
})