/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client', 'Constructors/orderConstructor', 'Services/positioningService'], function(app, io){
    function socketService(regionService, orderCreator, $interval, positioningService){
        var socket;
        var $scope;
        function SocketClient(introduce){
            this.introduce = introduce;
        };

        SocketClient.prototype.connect = function(){
            this.socket = io('/', {forceNew: true});
            return this.introduce(arguments);
        };

        SocketClient.prototype.disconnect = function(){
            if(this.socket) this.socket.disconnect();
            return this;
        };

        SocketClient.prototype.updateRegion = function(point){
            var regionId = regionService.getRegionId(point);
            if(regionId) this.socket.emit('updateRegion', regionId);
        };

        SocketClient.prototype.getOrdersInRegion = function(regionId, scope){
            console.log('listen to region: ', regionId);
            this.socket.emit('listenRegion', regionId);
            this.socket.removeAllListeners('gotOrder');
            this.socket.on('gotOrder', function gotOrder(order){
                if(order && order.length){
                    console.log('got order: ', order);
                    order = orderCreator.getOrder(order);
                    if(order.length){
                        var length = order.length;
                        for(var i = 0; i < order.length; i++){
                            order[i].asyncBuildRoute().then(
                                function success(completeOrder){
                                    scope.orders.push(completeOrder);
                                    length--;
                                }
                            )
                        }
                    }else if(order.basics){
                        order.asyncBuildRoute().then(
                            function success(completeOrder){
                                scope.orders.unshift(completeOrder);
                            }
                        )
                    }
                }else{
                    console.log('no orders in this region');
                }
                var interval = $interval(function(){
                    if(!length){
                        //scope.$apply();
                        console.log('orders ready: ', scope.orders);
                        $interval.cancel(interval);
                    }
                }, 100);
            })
        }

        function getDriverClient(){
            console.log('get socketClient ', socket);
            if(socket) {
                console.log('app already connected');
                return socket;
            }
            function driverIntroducing(){

                var drvOpt = arguments[0],
                    position = drvOpt[0],
                    region = regionService.getRegionId(position),
                    socketClient = this.socket;

                $scope = drvOpt[1];
                socketClient.on('connect', function(){
                    var clientId;// = ipCookie('clientId');
                    socketClient.emit('driverComes',  region, clientId);
                });

                socketClient.on('newOrder', function(order){
                    console.log('new order: ', order);
                    if(order.length){
                        var length = order.length;
                        for(var i = 0; i < order.length; i++){
                            orderCreator.getOrder(order[i]).asyncBuildRoute().then(
                                function success(completeOrder){
                                    $scope.driver.orders.push(completeOrder);
                                    length--;
                                }
                            )
                        }
                        var interval = setInterval(function(){
                            if(!length){
                                $scope.$apply();
                                clearInterval(interval);
                            }
                        }, 100);
                    }else{
                        console.log('creating order from basics');
                        orderCreator.getOrder(order).asyncBuildRoute().then(
                            function success(completeOrder){
                                $scope.driver.orders.push(completeOrder);
                                console.log('order created: ', completeOrder, $scope.driver.orders);
                                $scope.$apply();
                            },
                            function error(){
                                console.log('order creator error');
                            }
                        )
                    }
                });
                socketClient.on('getId', function(drvId){
                    $scope.driver.id = drvId;
                    //ipCookie('clientId', drvId);
                    $scope.$apply();
                });
                socketClient.on('restoreState', function(driver){
                })

                socketClient.on('positionReq', function(){
                    positioningService.getCurrentPos().then(
                        function success(position){
                            socketClient.emit('positionResp', {
                                lat: position.lat(),
                                lng: position.lng()
                            });
                        }
                    )
                });

                socketClient.on('timeout', function(orderId){
                    console.log('timeout: ', orderId);
                    var orders = $scope.driver.orders;
                    for(var i = 0, length = orders.length; i < length; i++){
                        if(orders[i].id = orderId){
                            orders.splice(i, 1);
                            $scope.$apply();
                            return;
                        }
                    }
                });
                return this;
            }
            socket = new SocketClient(driverIntroducing);
            console.log('socket created', socket);
            return socket;
        };

        function getOperatorClient(){
            function operatorIntroducing(){
                var socketClient = this.socket;
                socketClient.on('connect', function(){
                    socketClient.emit('operatorComes');
                });
                return this;
            }
            return new SocketClient(operatorIntroducing);
        }

        function getPassengerClient(){
            function passengerIntroducing(){
                var socketClient = this.socket;
                socketClient.on('connect', function(){
                    socketClient.emit('operatorComes');
                });
                return this;
            }

            return new SocketClient(passengerIntroducing);
        }

        return {
            getDriverClient: getDriverClient,
            getOperatorClient: getOperatorClient,
            getPassengerClient: getPassengerClient
        }
    }

    app.factory('socketService', socketService);
});