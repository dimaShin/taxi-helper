var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
    var url = req.url;
    var mimeTypes = {
        js: 'text/javascript',
        css: 'text/css',
        gif: 'image/gif',
        png: 'image/png',
        html: 'text/html'
    };
    if(url.match(/favicon/)) return;
    if(!url.match(/\.\w{1,4}$/i)){
        url = 'index.html';
    }else{
        url = url.substr(1);
        var dotIndex = url.lastIndexOf('.') + 1;
        if(dotIndex !== 0){
            var ext  = url.substr(dotIndex);
            if(ext === 'map') return;
            var mimeType = mimeTypes[ext];
            if(!mimeType) mimeType = 'text/plain';
        }

    }
    //console.log(url);
    fs.readFile(url,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ');
            }
            res.writeHead(200, {'Content-type': mimeType});
            res.end(data);
        });
}
var regions = {};
var orders = [];
var timeout = 600000;
var driverIds = [
    'driver1',
    'driver2',
    'driver3',
    'driver4',
    'driver5'
];
var drivers = {};

io.on('connection', function (socket) {
    //var cookies = cookiesParser(socket.request.headers.cookie);
    console.log('user connected: ', socket.conn.remoteAddress);
    socket.emit('connect');
    socket.on('driverComes', function(rId, cId){
        if(!cId) {
            cId = new Date().getTime(); //driverIds.shift();
            socket.emit('getId', cId);
        }else{
            socket.emit('restoreState', drivers[cId]);
        }

        console.log('driver comes');

        if(!regions[rId]) regions[rId] = new Region(rId);
        regions[rId].addDriver(cId, socket);
    });

    socket.on('operatorComes', function(){
        console.log("it's operator");
        socket.on('newOrder', function (order) {
            order.status = 0;
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
        });
        socket.on('driverPosReq', function(drvId){
            console.log('driver position request');
            var drv = getSmthById(drvId, drivers).smth;
            drv.socket.emit('positionReq');
            drv.socket.on('positionResp', function(position){
                socket.emit('driverPosResp', position);
                console.log('got position: ', position);
            });
            console.log('got driver: ', drv);
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
    this.listeners = [];
}

function isOrderNotSpoiled(order){
    var curTimestamp = new Date().getTime();
    console.log('is order spoiled: ', curTimestamp - order.timestamp, timeout);
    if(curTimestamp - order.timestamp > timeout){
        console.log('timeout for order expired; order canceled');
        return;
    }
    return true;
}

Region.prototype.addDriver = function(id, socket, isMoving){
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
    if(!isMoving){
        drivers[id] = driver;
        socket.on('disconnect', function(){
            region.removeDriver(id);
            console.log('driver removed: ', id);
        });
        socket.on('canceledOrder', function(order){
            if(!isOrderNotSpoiled(order)) return;
            if(!order.canceledDrivers) order.canceledDrivers = [];
            order.canceledDrivers.push(id);
            console.log('order canceled, searching new driver', order);
            region.newOrder(order);
        });
        socket.on('acceptedOrder', function(order){
            console.log('acceping order: ', order);
            var //index = getSmthById(order.id, region.orders).index,
                order = getSmthById(order.id, orders).smth;
            //region.orders.splice(index, 1);
            order.cabId = id;
            order.status = 1;
            driver.hasOrder = order;
            console.log('order accepted: ', order);
        });
        socket.on('driverArrived', function(order){
            var order = getSmthById(order.id, orders).smth;
            order.status = 2;
            console.log('driver arrived: ', order);
        });
        socket.on('completeOrder', function(order){
            var order = getSmthById(order.id, orders).smth;
            order.complete = id;
            order.status = 4;
            driver.hasOrder = false;
            console.log('order completed: ', order);
        });
        socket.on('updateRegion', function(regionId){
            if(this.id !== regionId){
                region.removeDriver(driver.id);
                if(!regions[regionId]) regions[regionId] = new Region(regionId);
                regions[regionId].addDriver(driver.id, driver.socket, true);
            }
        });
        socket.on('listenRegion', function(regionId){
            var orders = [];
            if(!regions[regionId]) regions[regionId] = new Region(regionId);
            console.log('region: ', regions[regionId]);
            for(var i = 0; i < regions[regionId].orders.length; i++){
                var order = regions[regionId].orders[i]
                if(!isOrderNotSpoiled(order)) continue; //ToDO delete spoiled order
                if(order.status == 0) {
                    console.log('suited order: ', order);
                    orders.push(order)
                }else{
                    console.log('order not suited', order);
                }
            }
            regions[regionId].addListener(socket);
            socket.emit('gotOrder', orders);
        })
        socket.on('updateOrderStatus', function(updatedOrder){
            var order = getSmthById(updatedOrder.id, orders).smth;
            order.status = updatedOrder.status;
            console.log('updating order status: ', order);
        })
    }
};

Region.prototype.addListener = function(socket){
    for(var i in regions){
        if(regions[i].listeners.length){
            var listeners = regions[i].listeners;
            if(listeners.indexOf(socket) !== -1){
                listeners.splice(listeners.indexOf(socket), 1);
                break;
            }
        }
    }
    this.listeners.push(socket);
};

function getSmthById(id, collection){
    for(var i in collection){
        if(collection[i].id === id) return {index: i, smth: collection[i]}
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
    this.orders.push(order);
    if(this.listeners.length){
        console.log('there are listeners on this region!');
        for(var i = 0; i < this.listeners.length; i++){
            this.listeners[i].emit('gotOrder', order);
        }
    }
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
    this.hasOrder = false;
};

Driver.prototype.sendOrder = function(order){
    this.socket.emit('newOrder', order);
};

function cookiesParser(cookies){
    console.log('start parsing cookies: ', cookies);
    if(!cookies) return {};
    var arr = cookies.split(';'),
        obj = {};
    for(var i = 0; i < arr.length; i++){
        var split = arr[i].split('=');
        obj[split[0].trim()] = split[1].trim();
    }
    console.log('cookies: ', obj);
    return obj;
}