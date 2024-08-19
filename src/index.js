const fs = require('fs');
const fsPromises = fs.promises;
const { create } = require('xmlbuilder2')


binToXml().catch(console.error)

async function binToXml() {
  let filehandle = null
 
  try {
    //open bin
    filehandle = await doOpen('c://temp//tst3.bin', 'r+')

    //open xml
    const gpx = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('gpx', { version: '1.0' })
      .ele('name').txt('').up()
      .ele('trk').ele('trkseg')

    let header = await readBytes(filehandle, 2)
    console.log(header, header.compare(new Buffer.from([0x00, 0x0F])) == 0)
    let IMEI = await readBytes(filehandle, 15)
    console.log('IMEI:', bufferToString(IMEI))

    let record
    while (record = await readRecord(filehandle)) {
      console.log(record)
      gpx.ele('trkpt', { lat: record.lat, lon: record.lon })
        .ele('ele').txt(record.alt).up()
        .ele('time').txt(record.date.toISOString()).up()

      await readAVL(filehandle)
    }
    
    const gpxString = gpx.end({ prettyPrint: true })
    await fsPromises.writeFile('C://Temp//tst3.gpx',gpxString)

  } finally {
    if (filehandle) { await filehandle.close() }
  }
}
 

async function doOpen(fileName) {
  const fh = await fsPromises.open(fileName, 'r+')
  return fh
}

async function readBytes(fh, length) {
  let buffer = new Buffer.alloc(length)
  let ret = await fh.read(buffer, 0, length, null) 
  if (ret.bytesRead > 0) {return buffer} else { return false }
  
}

async function readAVL(filehandle) {
  let avl = new Buffer.from([])
  while (avl.length < 8 || !Buffer.compare(avl.subarray(avl.length-8), new Buffer.from([0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]))==0) {
    avl = Buffer.concat([avl, await readBytes(filehandle, 2)])
  }
}

async function readRecord(filehandle) {
  
  let dateBytes = await readBytes(filehandle, 8)
  if (dateBytes) {
    let record = {}

    record.date = new Date(bufferToLong(dateBytes))
    record.priority = (await readBytes(filehandle, 1)).readUInt8()
    record.lon = (await readBytes(filehandle, 4)).readInt32BE()/10000000
    record.lat = (await readBytes(filehandle, 4)).readInt32BE()/10000000
    record.alt = (await readBytes(filehandle, 2)).readUInt16BE()
    record.ang = (await readBytes(filehandle, 2)).readUInt16BE()
    record.sat = (await readBytes(filehandle, 1)).readUInt8()
    record.speed = (await readBytes(filehandle, 2)).readUInt16BE()
    return record
  } else {
    return false
  }
  
}

function bufferToString(buffer) {
  return [...buffer].map(v=>byteHex(v)).join(' ')
}
function byteHex(byte) {
  return ('0' + (byte).toString(16)).slice(-2)
}

function bufferToLong(buffer) {
  var value = 0
  
  let byteArray = [...buffer].reverse()
  
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }
  
  return value;
}