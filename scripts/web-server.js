var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
    var url = req.url;
    if(!url.match(/\.\w{1,4}$/i)){
        url = 'index.html';
    }else{
        url = url.substr(1);
    }
    //console.log(url);
    fs.readFile(url,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ', url);
            }
            res.writeHead(200);
            res.end(data);
        });
}
var regions = {};
var orders = [];
var timeout = 600000;
io.on('connection', function (socket) {
    console.log('user connected');
    socket.emit('connect');

    socket.on('driverComes', function(rId){
        console.log('driver comes');
        var drvId = new Date().getTime();
        socket.emit('getId', drvId);
        if(!regions[rId]) regions[rId] = new Region(rId);
        regions[rId].addDriver(drvId, socket);
    });

    socket.on('operatorComes', function(){
        console.log("it's operator");
        socket.on('newOrder', function (order) {
            console.log('newOrder: ', order);
            var rId = order.region;
            if(!regions[rId]) regions[rId] = new Region(rId);
            regions[rId].newOrder(order);
            orders.push(order);
        });
        socket.on('getOrder', function(orderId){
            console.log('searching fo order: ', orderId);
            var order = getSmthById(orderId, orders);
            if(order){
                order = order.smth;
                console.log('found one: ', order);
                socket.emit('orderFound', order);
            }else{
                console.log('no such order in: ', orders);
                socket.emit('noSuchOrder');
            }
        })
    });

    socket.on('disconnect', function(){
        console.log('user disconnect');
    })
});

function Region(id){
    this.id = id;
    this.drivers = [];
    this.delayedOrders = [];
    this.orders = [];
}

Region.prototype.addDriver = function(id, socket){
    var region = this,
        driver = new Driver(id, socket);
    region.drivers.push(driver);
    if(this.delayedOrders.length){
        var curTime = new Date().getTime();
        for(var i = this.delayedOrders.length - 1; i >= 0; i--){
            if(curTime - this.delayedOrders[i].timestamp > timeout) this.delayedOrders.splice(i, 1);
        }
        if(this.delayedOrders.length){
            console.log('found delayed order');
            driver.sendOrder(this.delayedOrders);
            this.delayedOrders = [];
        }
    }
    socket.on('disconnect', function(){
        region.removeDriver(id);
        console.log('driver removed: ', id);
    });
    socket.on('canceledOrder', function(order){
        var curTimestamp = new Date().getTime();
        console.log('is order spoiled: ', curTimestamp - order.timestamp, timeout);
        if(curTimestamp - order.timestamp > timeout){
            console.log('timeout for order expired; order canceled');
            return;
        }
        if(!order.canceledDrivers) order.canceledDrivers = [];
        order.canceledDrivers.push(id);
        console.log('order canceled, searching new driver', order);
        region.newOrder(order);
    });
    socket.on('acceptedOffer', function(order){
        var index = getSmthById(order.id, region.orders).index;
        region.orders.splice(index, 1);
        getSmthById(order.id, orders).smth.accepted = id;
    });
    socket.on('completeOrder', function(order){
        getSmthById(order.id, orders).smth.complete = id;
    });
};

function getSmthById(id, collection){
    for(var i in collection){
        if(collection.hasOwnProperty(i) && collection[i] === id) return {index: i, smth: collection[i]}
    }
}

Region.prototype.removeDriver = function(id){
    for(var i = 0; i < this.drivers.length; i++){
        if(this.drivers[i].id === id){
            this.drivers.splice(i, 1);
        }
    }
};

Region.prototype.newOrder = function (order) {
    console.log('seeking driver for order');
    var drivers = this.drivers.slice(0);
    for(var i = drivers.length-1; i >= 0; i--){

        if(order.canceledDrivers && order.canceledDrivers.indexOf(drivers[i].id) !== -1){
            drivers.splice(i, 1);
        }
    }
    if(!drivers.length){
        console.log('no drivers, order delayed');
        this.delayedOrders.push(order);
        return;
    }
    console.log('driver found: ', drivers[0].id);
    drivers[0].sendOrder(order);
};

function Driver(id, socket){
    this.id = id;
    this.socket = socket;
};

Driver.prototype.sendOrder = function(order){
    this.socket.emit('newOrder', order);
};