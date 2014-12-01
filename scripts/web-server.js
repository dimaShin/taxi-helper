var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
    var url = req.url;
    if(!url.match(/\.\w{1,4}$/i)){
        //var hash = url;
        url = 'index.html';
    }else{
        url = url.substr(1);
    }
    //console.log(url);
    fs.readFile(url,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}
var drivers = [];
var regions = {};
var timeout = 30000;
io.on('connection', function (socket) {
    console.log('user connected');
    socket.emit('connect');

    socket.on('introduce', function(data){
        console.log('introducing');
        if(data.driver) {
            var drvId = new Date().getTime();
            drivers.push(drvId);
            socket.emit('getId', drvId);
            if(!regions[data.region]) regions[data.region] = [];
            regions[data.region].push({
                id: drvId,
                socket: socket
            });
            console.log("it's a driver: ", data, regions[data.region]);
            handleRemoveDriver(socket, data.region);
        }else{
            console.log("it's operator");
            socket.on('newOrder', function (data) {
                console.log('newOrder: ', data);
                if(regions[data.region] && regions[data.region].length){
                    sendOrder(data);
                }else{
                    var interval = setInterval(function(){
                        var curTimestamp = new Date().getTime;
                        if(curTimestamp - data.timestamp > timeout){
                            clearInterval(interval);
                            socket.send(false);
                        }else if(regions[data.region] && regions[data.region].length){
                            sendOrder(order);
                            clearInterval(interval);
                        }
                    }, 500);
                    console.log('no drivers in this region');

                }

            });
        }
    });
    socket.on('disconnect', function(){
        console.log('user disconnect');
    })
});

function sendOrder(order){
    var socket = regions[order.region].shift();
    socket.emit('newOrder', order);
    regions[order.region].push(socket);
    console.log('driver found!', regions);
}

function handleRemoveDriver(socket, region){
    var index = regions[region].indexOf(socket);
    socket.on('disconnect', function(){
        console.log('removing driver: ', index, regions);
        regions[region].splice(index, 1);
        console.log('driver removed: ', regions);
    })
}