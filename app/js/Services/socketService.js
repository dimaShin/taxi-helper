/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client', 'Constructors/orderConstructor'], function(app, io, orderConstructor){
    function socketService(regionService, orderCreator){
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

        SocketClient.prototype.updateScope = function(scope){
            $scope = scope;
        };

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
                                    $scope.orders.push(completeOrder);
                                    length--;
                                }
                            )
                        }
                        var interval = setInterval(function(){
                            if(!length){
                                this.$scope.$apply();
                                clearInterval(interval);
                            }
                        }, 100);
                    }else{
                        console.log('creating order from basics');
                        orderCreator.getOrder(order).asyncBuildRoute().then(
                            function success(completeOrder){
                                $scope.orders.push(completeOrder);
                                $scope.$broadcast()
                                console.log('order created: ', completeOrder, $scope.orders);
                                $scope.$apply();
                            },
                            function error(){
                                console.log('order creator error');
                            }
                        )
                    }
                });
                socketClient.on('getId', function(drvId){
                    $scope.drvId = drvId;
                    //ipCookie('clientId', drvId);
                    $scope.$apply();
                });
                socketClient.on('restoreState', function(driver){
                })
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

        return {
            getDriverClient: getDriverClient,
            getOperatorClient: getOperatorClient
        }
    }

    app.factory('socketService', socketService);
});