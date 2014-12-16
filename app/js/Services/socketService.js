/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client', 'Constructors/orderConstructor', 'Services/positioningService'],

function(app, io){
        /**
         * @module socketService
         * @exports regionService, orderCreator, positioningService, ngInterval
         * creates and serves connection between client and server
         */
    function socketService(regionService, orderCreator, $interval, positioningService){
        var socket;
        var $scope;

            /**
             * @class SocketClient
             * @param {function}introduce
             * @constructor
             * creates example of SocketClient
             */
        function SocketClient(introduce){
            this.introduce = introduce;
        };
            /**
             * @function connect
             * connects to the socketServer
             * @returns {introduce function}
             */
        SocketClient.prototype.connect = function(){
            this.socket = io('/', {forceNew: true});
            return this.introduce(arguments);
        };
            /**
             * @function disconnect
             * disconnect from the localhost socketServer
             * @returns {SocketClient}
             */
        SocketClient.prototype.disconnect = function(){
            if(this.socket) this.socket.disconnect();
            return this;
        };
            /**
             * @function updateRegion
             * @param point
             * @fires updateRegion
             * updates driver's region according to point
             */
        SocketClient.prototype.updateRegion = function(point){
            var regionId = regionService.getRegionId(point);
            if(regionId) this.socket.emit('updateRegion', regionId);
        };

            /**
             * @function getOrdersInRegion
             * @param regionId
             * @param scope
             * @fires listenRegion
             * gets all orders in region and start listening for new orders
             */
        SocketClient.prototype.getOrdersInRegion = function(regionId, scope){
            this.socket.emit('listenRegion', regionId);
            this.socket.removeAllListeners('gotOrder');
            this.socket.on('gotOrder', function gotOrder(order){
                if(order && order.length){
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
                }
                var interval = $interval(function(){
                    if(!length){
                        $interval.cancel(interval);
                    }
                }, 100);
            })
        }
            /**
             * @function getDriverClient
             * @returns {SocketClient}
             * create or returns example of SocketClient for drivers and sings it on all socket events
             */
        function getDriverClient(){
            console.log('get socketClient ', socket);
            if(socket) {
                console.log('app already connected');
                return socket;
            }
                /**
                 *@function driverIntroducing
                 *  sings socket on all events
                 *  @params arguments[0]{latLngObject}position, arguments[1]{ng-scope}
                 *
                 */
            function driverIntroducing(){

                var drvOpt = arguments[0],
                    position = drvOpt[0],
                    region = regionService.getRegionId(position),
                    socketClient = this.socket;

                $scope = drvOpt[1];
                    /**
                     * @function driverConnection
                     * @fires driverComes
                     * tells server that driver connected
                     *
                     */
                socketClient.on('connect', function driverConnection(){
                    socketClient.emit('driverComes',  region);
                });
                    /**
                     * @function driverGetsOrder
                     * @param order
                     * fires when new order came for driver
                     * creates order and route for it from basics and push it into ng-scope
                     */
                socketClient.on('newOrder', function(order){
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
                        orderCreator.getOrder(order).asyncBuildRoute().then(
                            function success(completeOrder){
                                $scope.driver.orders.push(completeOrder);
                                $scope.$apply();
                            },
                            function error(){
                            }
                        )
                    }
                });
                    /**
                     * @function setDriverId
                     * @param {int} drvId
                     * gets id for driver from server and push it into ng-scope
                     */
                socketClient.on('getId', function setDriverId(drvId){
                    $scope.driver.id = drvId;
                    $scope.$apply();
                });
                    /**
                     * @function getDriverPosition
                     * @fires positionResp
                     * gets current driver position and send it back
                     */
                socketClient.on('positionReq', function getDriverPosition(){
                    positioningService.getCurrentPos().then(
                        function success(position){
                            socketClient.emit('positionResp', {
                                lat: position.lat(),
                                lng: position.lng()
                            });
                        }
                    )
                });
                    /**
                     * @function timeoutOrder
                     * @param {int}orderId
                     * removes order from driver when timeout for decision expires
                     */
                socketClient.on('timeout', function timeoutOrder(orderId){
                    var orders = $scope.driver.orders;
                    for(var i = 0, length = orders.length; i < length; i++){
                        if(orders[i].id = orderId){
                            orders.splice(i, 1);
                            $scope.$apply();
                            return;
                        }
                    }
                });
            }

            socket = new SocketClient(driverIntroducing);
            return socket;
        };
            /**
             * @function getOperatorClient
             * @returns {SocketClient}
             * creates socket client for operator and sings it on all events
             */
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
            /**
             * @function getPassengerClient
             * @returns {SocketClient}
             * creates socket client for passenger and sings it on all events
             */
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

