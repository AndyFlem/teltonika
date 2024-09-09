//const fs = require('fs');
//import * as fs from 'fs'
//const fsPromises = fs.promises;

function parse(packet) {
  let records = []
  try {
    //filehandle = await doOpen(fileName, 'r+')

    let preamble = packet.subarray(0,4)//await readBytes(filehandle, 4)
    if (preamble.compare(new Buffer.from([0x00, 0x00, 0x00, 0x00])) != 0) {
      console.error('Invalid preamble')
      return records
    }
    let packetLength = packet.subarray(4,8).readInt32BE()
    let codecId = packet.subarray(8,9).readUInt8()
    if (codecId != 8) {
      console.error('Invalid codec ID')
      return records
    }
    let recordCount = packet.subarray(9,10).readUInt8()

    let avlBytes = (packetLength - 3) / recordCount
    let ioBytes = avlBytes - 24

    console.log('Codec ID:', codecId)
    console.log('Packet length:', packetLength)
    console.log('Record count:', recordCount)
    console.log('AVL Record bytes: ' + avlBytes)
    console.log('IO bytes: ' + ioBytes)

    let recordNo = 1
    
    while (recordNo <= recordCount) {
      let recordBytes = packet.subarray(10+((recordNo-1)*avlBytes),10+(recordNo*avlBytes))
      let record = {recordNo: recordNo}

      record.date = new Date(bufferToLong(recordBytes.subarray(0, 8)))
      record.priority = recordBytes.readUInt8(8)
      record.lon = recordBytes.readInt32BE(9)/10000000
      record.lat = recordBytes.readInt32BE(13)/10000000
      record.alt = recordBytes.readUInt16BE(17)
      record.ang = recordBytes.readUInt16BE(19)
      record.sat = recordBytes.readUInt8(21)
      record.speed = recordBytes.readUInt16BE(22)
      recordNo++
      console.log('Record:' + JSON.stringify(record))
      records.push(record)  
    }
    console.log(records.length)
    return records
  } catch (err) {
    console.error(err)
    return
    }
}

function bufferToLong(buffer) {
  var value = 0
  
  let byteArray = [...buffer].reverse()
  
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }
  
  return value;
}


export { parse }