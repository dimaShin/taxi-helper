/**
 * Created by iashind on 27.11.14.
 */
'use strict';
define(['app', 'socket.io-client'], function(app, socket){

    function socketService(regionService){
        var io;
        function connectDriver(position, $scope){
            console.log('connecting to the socket');
            var region = regionService.getRegionId(position);
            io = socket();
            io.on('connection', function(){
                io.emit('introduce', {
                    driver: true,
                    region: region
                })
            });
            io.on('newOrder', function(order){
                console.log('new order!!!!', order);
                $scope.routes.push(order);
                $scope.$apply();
            })
        }

        function disconnect(){
            if(io) io.disconnect();
        }

        return {
            connectDriver: connectDriver,
            disconnect: disconnect
        }
    }

    app.factory('socketService', socketService);
});