//const fs = require('fs');
import * as fs from 'fs'
const fsPromises = fs.promises;

async function parse(fileName) {
  let filehandle = null

  try {
    //open bin
    filehandle = await doOpen(fileName, 'r+')

    let preamble = await readBytes(filehandle, 4)
    if (preamble.compare(new Buffer.from([0x00, 0x00, 0x00, 0x00])) != 0) {
      console.error('Invalid preamble')
      return
    }
    let packetLength = (await readBytes(filehandle, 4)).readInt32BE()
    console.log('Packet length:', packetLength)
    let codecId = (await readBytes(filehandle, 1)).readUInt8()
    console.log('Codec ID:', codecId)
    if (codecId != 8) {
      console.error('Invalid codec ID')
      return
    }
    recordCount = (await readBytes(filehandle, 1)).readUInt8()
    console.log('Record count:', recordCount)

    let avlBytes = (packetLength - 3) / recordCount
    console.log('AVL Record bytes: ' + avlBytes)
    let ioBytes = avlBytes - 24
    console.log('IO bytes: ' + ioBytes)

    let recordNo = 1
    while (recordNo < recordCount) {
      let recordBytes = (await readBytes(filehandle, avlBytes))
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
      console.log(record)
  
    }
  } catch (err) {
    console.error(err)
    return
    }
}

async function readBytes(fh, length) {
  let buffer = new Buffer.alloc(length)
  let ret = await fh.read(buffer, 0, length, null) 
  if (ret.bytesRead > 0) {return buffer} else { return false }  
}

function bufferToLong(buffer) {
  var value = 0
  
  let byteArray = [...buffer].reverse()
  
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }
  
  return value;
}

async function doOpen(fileName) {
  const fh = await fsPromises.open(fileName, 'r+')
  return fh
}


export { parse }