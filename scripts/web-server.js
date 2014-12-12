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
var timeoutPerDriver = 10000;
var drivers = {};
var timeouts = {};

var storage = {
    regions: {},
    orders: [],
    drivers: {},
    getRegion: function getRegion(id){
        if(!this.regions[id]) this.regions[id] = new Region(id);
        return this.regions[id];
    },
    getDriver: function getDriver(id){
        return this.drivers[id];
    },
    setDriver: function setDriver(id, socket){
        this.drivers[id] = new Driver(id, socket);
    },
    removeDriver: function removeDriver(id){
        delete this.drivers[id];
    },
    getOrder: function getOrder(id){
        return getSmthById(id, this.orders).smth;
    },

    setOrder: function setOrder(order){
        if(getSmthById(order.id, this.orders)) return;
        this.orders.push(order);
    },
    updateOrder: function updateOrder(basics){
        var order = this.getOrder(basics.id);
        for(var i in basics){
            order[i] = basics[i];
        }
    }

}

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
        storage.getRegion(rId).addDriver(cId, socket);
        //if(!regions[rId]) regions[rId] = new Region(rId);
        //regions[rId].addDriver(cId, socket);
    });

    socket.on('operatorComes', function(){
        //console.log("it's operator");
        socket.on('newOrder', function (order) {
            order.status = 0;
            //console.log('newOrder: ', order);
            var rId = order.region;
            storage.getRegion(rId).newOrder(order, 'socket on new order');
            storage.setOrder(order);
            //if(!regions[rId]) regions[rId] = new Region(rId);
            //regions[rId].newOrder(order);
            //orders.push(order);
        });
        socket.on('getOrder', function(orderId){
            console.log('searching fo order: ', orderId);

            //var order = getSmthById(orderId, orders);
            var order = storage.getOrder(orderId);
            if(order){
                //order = order.smth;
                console.log('found one: ', order);
                socket.emit('orderFound', order);
            }else{
                //console.log('no such order in: ', orders);
                socket.emit('noSuchOrder');
            }
        });
        socket.on('driverPosReq', function(drvId){
            //console.log('driver position request');
            //var drv = getSmthById(drvId, drivers).smth;
            var drv = storage.getDriver(drvId);
            drv.socket.emit('positionReq');
            drv.socket.on('positionResp', function(position){
                socket.emit('driverPosResp', position);
                //console.log('got position: ', position);
            });
            //console.log('got driver: ', drv);
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
            //console.log('found delayed order');
            driver.sendOrder(this.delayedOrders);
            this.delayedOrders = [];
        }
    }
    if(!isMoving){
        //drivers[id] = driver;
        storage.setDriver(id, socket);
        socket.on('disconnect', function(){
            region.removeDriver(id);
            storage.removeDriver(id);
            //console.log('driver removed: ', id);
        });
        socket.on('canceledOrder', function(order){
            order = storage.getOrder(order.id);
            clearTimeout(timeouts[order.id]);
            if(!isOrderNotSpoiled(order)) return;
            if(!order.canceledDrivers) order.canceledDrivers = [];
            order.canceledDrivers.push(id);
            region.newOrder(order, 'socket on cancelRoute');
        });
        socket.on('acceptedOrder', function(order){
            order.cabId = id;
            order.status = 1;
            order.arrivalTime = order.arrivalTime;
            storage.updateOrder(order);
            clearTimeout(timeouts[order.id]);
            //region.orders.splice(index, 1);

            driver.hasOrder = order;
        });
        socket.on('completeOrder', function(completedOrder){
            //var order = getSmthById(order.id, orders).smth;
            completedOrder.complete = id;
            completedOrder.status = 4;
            console.log('order complete: ', completedOrder.status);
            storage.updateOrder(completedOrder);
            driver.hasOrder = false;
            //var order = storage.getOrder(completedOrder.id);
            //order.complete = id;
            //
            //order.arrivalTime = completedOrder.arrivalTime;

            //console.log('order completed: ', order);
        });
        socket.on('updateRegion', function(regionId){
            if(this.id !== regionId){
                region.removeDriver(driver.id);
                storage.getRegion(regionId).addDriver(driver.id, driver.socket, true);
                //if(!regions[regionId]) regions[regionId] = new Region(regionId);
                //regions[regionId].addDriver(driver.id, driver.socket, true);
            }
        });
        socket.on('listenRegion', function(regionId){
            var orders = [];
            var region = storage.getRegion(regionId);
            region.addListener(socket);
            for(var i = 0; i < region.orders.length; i++){
                var order = region.orders[i];
                if(!isOrderNotSpoiled(order)) continue; //ToDO delete spoiled order
                if(order.status == 0) {
                    orders.push(order)
                }else{
                    //console.log('order not suited', order);
                }
            }

            socket.emit('gotOrder', orders);
        })
        socket.on('updateOrderStatus', function(updatedOrder){
            storage.updateOrder(updatedOrder);
            //console.log('updating order status: ', updatedOrder);
            //var order = storage.getOrder(updatedOrder.id);
            //var order = getSmthById(updatedOrder.id, orders).smth;
            //order.status = updatedOrder.status;
            //order.arrivalTime = updatedOrder.arrivalTime;

            //console.log('updating order status: ', order);
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
            return;
        }
    }
};

Region.prototype.newOrder = function (order, handler){
    console.log('seeking driver for order by ', handler);
    if(!getSmthById(order.id, this.orders)){
        console.log('adding order to the region');
        this.orders.push(order);
    }
    if(this.listeners.length){
        console.log('there are listeners on this region!');
        for(var i = 0; i < this.listeners.length; i++){
            this.listeners[i].emit('gotOrder', order);
        }
    }
    //console.log('seeking driver for order');
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
    var driver = this;
    driver.socket.emit('newOrder', order);
    if(order.length){
        for(var i = 0; i < order.length; i++){
            (function(order){
                timeouts[order.id] = setTimeout(function(){
                    //console.log('timeout for driver', order);
                    driver.socket.emit('timeout', order.id);
                    if(!order.canceledDrivers) order.canceledDrivers = [];
                    order.canceledDrivers.push(driver.id);
                    if(isOrderNotSpoiled(order)){
                        var region = storage.getRegion(order.region);
                        region.newOrder(order, 'timeout');
                    }
                }, timeoutPerDriver);
                console.log('timeOut set: ', order.id);
            })(order[i])
        }
    }else{
        timeouts[order.id] = setTimeout(function(){
            //console.log('timeout for driver', order);
            driver.socket.emit('timeout', order.id);
            if(!order.canceledDrivers) order.canceledDrivers = [];
            order.canceledDrivers.push(driver.id);
            if(isOrderNotSpoiled(order)){
                var region = storage.getRegion(order.region);
                region.newOrder(order, 'timeout');
            }
        }, timeoutPerDriver);
        console.log('timeOut set: ', order.id);
    }

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
