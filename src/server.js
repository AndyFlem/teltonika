const net = require('net');
const port = 4242;
const host = '172.31.46.147';
const fs = require('fs')

const server = net.createServer();
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function(data) {
        let dat = new Buffer.from(data)
        console.log('DATA ' + sock.remoteAddress + ': ', dat);
        fs.appendFile('dat.dat', dat , function (err) {
            if (err) throw err;
            console.log('Saved!');
          })
    })

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
});