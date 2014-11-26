var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
    fs.readFile(req.url.substr(1),
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.on('connection', function (socket) {
    console.log('user connected');
    socket.emit('connected', { hello: 'world' });
    socket.on('newOrder', function (data) {
        socket.broadcast.emit('newOrder', data);
        console.log('newOrder: ', data);
    });
});
io.on('newOrder', function(socket){

})