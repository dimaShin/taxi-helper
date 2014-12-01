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
io.on('connection', function (socket) {
    console.log('user connected');
    socket.emit('connect');

    socket.on('introduce', function(data){
        console.log('introducing');
        if(data.driver) {
            drivers.push(socket);
            console.log("it's a driver");
        }else{
            console.log("it's operator");
            socket.on('newOrder', function (data) {
                socket.broadcast.emit('newOrder', data);
                console.log('newOrder: ', data);
            });
        }
    });
    socket.on('disconnect', function(){
        console.log('user disconnect');
    })
});