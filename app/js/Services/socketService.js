/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client', 'Constructors/orderConstructor'], function(app, io, orderConstructor){

    function socketService(regionService){

        function SocketClient(introduce){
            this.introduce = introduce;
        };

        SocketClient.prototype.connect = function(){
            this.socket = io('http://localhost', {forceNew: true});
            console.log('connecting: ', arguments);
            return this.introduce(arguments);
        };

        SocketClient.prototype.disconnect = function(){
            if(this.socket) this.socket.disconnect();
            return this;
        };

        function getDriverClient(){
            function driverIntroducing(){
                console.log('position: ', arguments);
                var drvOpt = arguments[0],
                    position = drvOpt[0],
                    $scope = drvOpt[1],
                    region = regionService.getRegionId(position),
                    socketClient = this.socket;
                socketClient.on('connect', function(){
                    console.log('sending greetings');
                    socketClient.emit('introduce', {
                        driver: true,
                        region: region
                    })
                });
                socketClient.on('newOrder', function(order){
                    console.log('new order!!!!', order);
                    new orderConstructor(order).asyncBuildRoute().then(
                        function success(compliteOrder){
                            $scope.orders.push(compliteOrder);
                            $scope.$apply();
                        }
                    )


                });
                return this;
            }
            return new SocketClient(driverIntroducing);
        };

        function getOperatorClient(){
            function operatorIntroducing(){
                var socketClient = this.socket;
                socketClient.on('connect', function(){
                    socketClient.emit('introduce', {driver: false});
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