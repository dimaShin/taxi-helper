/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client'], function(app, io){

    function socketService(regionService){
        var socket;
        function connectDriver(position, $scope){
            console.log('connecting to the socket');
            var region = regionService.getRegionId(position);
            console.log('creating connection');
            socket = io('http://10.11.80.112', {forceNew: true});
            socket.on('connect', function(){
                console.log('sending greetings');
                socket.emit('introduce', {
                    driver: true,
                    region: region
                })
            });
            socket.on('newOrder', function(order){
                console.log('new order!!!!', order);
                $scope.routes.push(order);
                $scope.$apply();
            })
        }

        function disconnect(){
            if(socket) socket.disconnect();
        }

        return {
            connectDriver: connectDriver,
            disconnect: disconnect
        }
    }

    app.factory('socketService', socketService);
});