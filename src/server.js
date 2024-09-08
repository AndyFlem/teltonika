import * as net from 'net'
// import * as fs from 'fs'

import { parse } from './packet.js'

const port = 88
const host = '172.31.18.167'

const server = net.createServer()
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.')
})

let sockets = []

server.on('connection', function(sock) {
  console.log(new Date().toString() + ' - CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
  sockets.push(sock)

  sock.on('data', function(data) {
    let dat = new Buffer.from(data)
    console.log('DATA ' + sock.remoteAddress + ': ', dat)
    if (dat.subarray(0,3).compare(new Buffer.from([0x00, 0x00, 0x00, 0x0F])) == 0) {
      let imei = dat.subarray(4).toString('ascii')
      console.log(new Date().toString() + ' - IMEI: ' + imei)
      sock.imei = imei
      // send 0x01 on the socket
      sock.write(new Buffer.from([0x01]))
      
    }

  })

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
      let index = sockets.findIndex(function(o) {
          return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
      })
      if (index !== -1) sockets.splice(index, 1)
      console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
  })
})