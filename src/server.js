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
  console.log(new Date().toString() + ' - CONNECTED: ' + sockName(sock))
  sock.imei = 'unknown'
  sockets.push(sock)

  sock.on('data', function(data) {
    let dat = new Buffer.from(data)
    console.log(new Date().toString() + ' - DATA: ' + sockName(sock))
    if (dat.subarray(0,2).compare(new Buffer.from([0x00, 0x0F])) == 0) {
      let imei = dat.subarray(4).toString('ascii')
      console.log(new Date().toString() + ' - IMEI: ' + sockName(sock))
      sock.imei = imei
      // send 0x01 on the socket
      sock.write(new Buffer.from([0x01])) 
    } else {
      let records = parse(dat)
      console.log(`Got ${records.length} records.`)
      console.log(records[0])
      let resp = Buffer.allocUnsafe(4)
      resp.writeInt32BE(records.length)
      sock.write(resp)
    }
  })

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
      let index = sockets.findIndex(function(o) {
          return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
      })
      if (index !== -1) sockets.splice(index, 1)
      console.log(new Date().toString() + ' - CLOSED: ' + sockName(sock)) + '. Sockets open: ' + sockets.length
  })
})

function sockName(sock) {
  return sock.remoteAddress + ':' + sock.remotePort + ', IMEI:' + sock.imei
}