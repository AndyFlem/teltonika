import * as net from 'net'

const host = '172.31.18.167'

const upPort = 89
const downPort = 88

// Listen for downstream connections
const downServer = net.createServer()
downServer.listen(downPort, host, () => {
    
})