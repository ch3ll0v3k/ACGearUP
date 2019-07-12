const HOST = '192.168.0.180';
const PORT = 9996;

const binproto = require('bin-protocol');
const logger = require('mii-logger.js');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
// const message = Buffer.from('Some bytes');

const HANDSHAKE = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(0).result;
const UPDATE = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(1).result;
const SPOT = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(2).result;
const DISMISS = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(3).result;

function getGear( gear ){

  if( (+gear[0]) == 0 ) return 'R';
  if( (+gear[0]) == 1 ) return 'N';
  return (+gear[0]) -1;
}

function fromUInt8( data ){
  return (new binproto()).read( data ).UInt8().result;
}

function fromInt32LE( data ){
  return (new binproto()).read( data ).Int32LE().result;
}

function fromFloatLE( data ){
  return (new binproto()).read( data ).FloatLE().result;
}


// const res = Buffer.from([107,0,115,0,95,0,116,0,111,0,121,0,111,0,116,0,97,0,95,0,115,0,117,0,112,0,114,0,97,0,95,0,109,0,107,0,105,0,118,0,95,0,100,0,114,0,105,0,102,0,116,0,37,0,0,0,32,207,65,5,2,0,0,0,1,16,163,4,2,0,0,0,152,14,163,4,2,0,0,0,160,11,14,10,2,0,0,0,240,132,121,239,7,0,0,0,139,170,245,224,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,246,4,70,113,136,60,1,16,163,4,2,0,0,0,0,41,16,6,2,0,0,0,1,0,0,0,0,0,0,0,112,136,121,239,7,0,0,0,236,223,184,1,0,0,0,0,23,74,166,58,187,249,41,130,0,0,128,63,70,113,136,60,176,133,121,239,7,0,0,0,24,53,243,224,1,0,0,0,146,16,0,0,1,0,0,0,107,0,115,0,95,0,115,0,105,0,108,0,118,0,101,0,114,0,115,0,116,0,111,0,110,0,101,0,37,0,222,3,64,69,27,129,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,3,129,0,2,0,0,0,64,69,27,129,8,0,0,0,192,133,121,239,7,0,0,0,92,255,140,49,8,0,0,0,1,137,1,0,0,0,0,0,160,132,38,128,107,0,115,0,95,0,115,0,105,0,108,0,118,0,101,0,114,0,115,0,116,0,111,0,110,0,101,0,37,0,0,0,0,0,0,0,32,0,129,0,2,0,0,0,112,82,160,9,2,0,0,0,128,82,160,9,2,0,0,0,128,82,160,9,2,0,0,0,16,134,121,239,7,0,0,0,121,130,141,49,8,0,0,0,128,134,121,239,7,0,0,0,24,53,243,224,1,0,0,0], 'bin');


function send( buffs ){
  client.send( buffs, PORT, HOST, error => {
    if (error) {
      console.log(error)
      client.close()
    } else {
      console.log('Data sent !!!')
    }
  })
}

// function unpackArray( array, 'float', 84, 4, 4 ){
function unpackArray( array, dType, fromByte, bytesType, items ){

  let data = [];
  const upto = fromByte + ( bytesType * items );
  while( fromByte < upto ){
    switch( dType ){
      case 'float':
        data.push( fromFloatLE( array.slice( fromByte, (fromByte+bytesType) ) ) );
        break;
      case 'int':
        data.push( fromInt32LE( array.slice( fromByte, (fromByte+bytesType) ) ) );
        break;
    }
    fromByte += bytesType;
  }
  return data;

}

function RTCarInfo( _328b ){

  // {"type":"Buffer","data":[97,0,0,0,72,1,0,0,29,26,200,58,222,172,120,58,232,85,222,57,1,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,12,112,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,186,13,62,108,97,160,68,95,93,111,5,2,0,0,0,176,93,14,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,149,253,10,61,237,39,210,187,87,62,143,189,141,181,145,189,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,10,147,55,238,167,18,57,52,216,164,59,201,11,164,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,148,122,34,60,155,250,190,60,83,233,15,61,205,178,5,61,173,30,213,68,150,94,52,69,21,178,42,69,111,152,218,68,101,199,131,63,100,77,139,63,248,173,145,63,155,202,162,63,84,108,231,185,147,221,175,188,116,199,155,59,171,234,216,58,206,252,137,61,0,0,0,0,0,0,0,0,0,0,0,0,105,82,228,59,30,213,9,189,250,13,29,188,198,87,93,187,188,116,147,62,188,116,147,62,188,116,147,62,188,116,147,62,33,154,144,62,214,159,142,62,35,29,143,62,94,174,144,62,144,85,43,61,64,39,119,61,24,110,104,61,8,161,50,61,165,215,95,61,0,0,0,0,255,218,43,195,80,89,55,192,232,233,185,65]};


  // char
  let identifier = _328b.slice( 0, 2 );

  // console.log( ''+identifier )
  // return

  // int
  let size = fromInt32LE( _328b.slice( 2, 6 ) );
  // console.log( ''+size ); return;

  // // console.log( parseFloat( _328b.slice( 6, 10 ).reverse().toString('hex'), 16 ) );
  // return

  // let tmp = _328b.slice( 6, 20 ); // GForce V/H/F

  // let str = '';

  // for( let i in tmp ){
  //   str += ( (''+(+tmp[i])) ).padStart( 4, ' ' );
  // }

  // 0   0   0 128   
  // 0   0   0   0
  // 0   0   0   0
  // tmp = _328b.slice( 30, 42 ); // GForce V/H/F

  // str = '';
  // for( let i in tmp ) str += ( (''+(+tmp[i])) ).padStart( 4, ' ' );
  // console.log( str ); return;


  // float
  let speed_Kmh = fromFloatLE( _328b.slice( 6+2, 10+2 ) );
  // float
  let speed_Mph = fromFloatLE( _328b.slice( 12, 16 ) );
  // float
  let speed_Ms = fromFloatLE( _328b.slice( 16, 20 ) );
  // console.log( {speed_Kmh} ); return;

  // console.json({
  //   Kmh: speed_Kmh,
  //   Mph: speed_Mph,
  //   Ms: speed_Ms,
  // });

  // bool
  let isAbsEnabled = fromUInt8( _328b.slice( 20, 21 ) );
  // bool
  let isAbsInAction = fromUInt8( _328b.slice( 21, 22 ) );
  // bool
  let isTcInAction = fromUInt8( _328b.slice( 22, 23 ) );
  // bool
  let isTcEnabled = fromUInt8( _328b.slice( 23, 24 ) );
  // bool
  let isInPit = fromUInt8( _328b.slice( 24, 25 ) );
  // bool
  let isEngineLimiterOn = fromUInt8( _328b.slice( 25, 26 ) );

  // console.json({
  //   isAbsEnabled,
  //   isAbsInAction,
  //   isTcInAction,
  //   isTcEnabled,
  //   isInPit,
  //   isEngineLimiterOn,
  // });
  // return


  // float
  let accG_vertical = fromFloatLE( _328b.slice( 26, 30 ) );
  // float
  let accG_horizontal = fromFloatLE( _328b.slice( 30, 34 ) );
  // float
  let accG_frontal = fromFloatLE( _328b.slice( 34, 38 ) );

  // console.json({ accG_vertical, accG_horizontal, accG_frontal, });
  // return;

  // int
  let lapTime = fromInt32LE( _328b.slice( 38, 42 ) );
  // int
  let lastLap = fromInt32LE( _328b.slice( 42, 46 ) );
  // int
  let bestLap = fromInt32LE( _328b.slice( 46, 50 ) );
  // int
  let lapCount = fromInt32LE( _328b.slice( 50, 54 ) );
  // console.json({ lapTime, lastLap, bestLap, lapCount });
  // return;


  // float
  let gas = fromFloatLE( _328b.slice( 54+2, 58+2 ) );
  // float
  let brake = fromFloatLE( _328b.slice( 58+2, 62+2 ) );
  // float
  let clutch = fromFloatLE( _328b.slice( 62+2, 66+2 ) );
  // float
  let engineRPM = fromFloatLE( _328b.slice( 66+2, 70+2 ) );
  // float
  let steer = fromFloatLE( _328b.slice( 70+2, 74+2 ) );
  // console.log({ gas, brake, clutch, engineRPM, steer }); return;

  // int
  let gear = getGear( _328b.slice( 76, 77 ) );
  // console.log({gear}); return;

  // float
  let cgHeight = fromFloatLE( _328b.slice( 80, 84 ) );

  // float [4]
  let wheelAngularSpeed = unpackArray( _328b, 'float', 84, 4, 4 );
  // console.json({wheelAngularSpeed}); return;

  // float [4]
  let slipAngle = unpackArray( _328b, 'float', 100, 4, 4 );
  // float [4]
  let slipAngle_ContactPatch = unpackArray( _328b, 'float', 116, 4, 4 );
  // float [4]
  let slipRatio = unpackArray( _328b, 'float', 132, 4, 4 );
  // float [4]
  let tyreSlip = unpackArray( _328b, 'float', 148, 4, 4 );
  // float [4]
  let ndSlip = unpackArray( _328b, 'float', 164, 4, 4 );
  // float [4]
  let load = unpackArray( _328b, 'float', 180, 4, 4 );
  // float [4]
  let Dy = unpackArray( _328b, 'float', 196, 4, 4 );
  // float [4]
  let Mz = unpackArray( _328b, 'float', 212, 4, 4 );
  // console.json({ slipAngle, slipAngle_ContactPatch, slipRatio, tyreSlip, ndSlip, load, Dy, Mz }); return;

  // float [4]
  let tyreDirtyLevel = unpackArray( _328b, 'float', 228, 4, 4 );
  // console.json({ tyreDirtyLevel }); return;

  // float [4]
  let camberRAD = unpackArray( _328b, 'float', 228+16, 4, 4 );
  // float [4]
  let tyreRadius = unpackArray( _328b, 'float', 228+32, 4, 4 );
  // float [4]
  let tyreLoadedRadius = unpackArray( _328b, 'float', 228+48, 4, 4 );
  // float [4]
  let suspensionHeight = unpackArray( _328b, 'float', 228+64, 4, 4 );
  // console.json({ camberRAD, tyreRadius, tyreLoadedRadius, suspensionHeight });

  // float
  let carPositionNormalized = _328b.slice( 228+64+16, 228+64+16+4 );
  // float
  let carSlope = _328b.slice( 228+64+20, 228+64+20+4 );
  // float [3]
  let carCoordinates = unpackArray( _328b, 'float', 228+64+20+4, 4, 3 );
  // console.json({carCoordinates});

  // struct RTCarInfo {
  //   char identifier;
  //   int size;

  //   float speed_Kmh;
  //   float speed_Mph;
  //   float speed_Ms;

  //   bool isAbsEnabled;
  //   bool isAbsInAction;
  //   bool isTcInAction;
  //   bool isTcEnabled;
  //   bool isInPit;
  //   bool isEngineLimiterOn;

  //   float accG_vertical;
  //   float accG_horizontal;
  //   float accG_frontal;

  //   int lapTime;
  //   int lastLap;
  //   int bestLap;
  //   int lapCount;

  //   float gas;
  //   float brake;
  //   float clutch;
  //   float engineRPM;
  //   float steer;
  //   int gear;
  //   float cgHeight;

  //   float wheelAngularSpeed[4];
  //   float slipAngle[4];
  //   float slipAngle_ContactPatch[4];
  //   float slipRatio[4];
  //   float tyreSlip[4];
  //   float ndSlip[4];
  //   float load[4];
  //   float Dy[4];
  //   float Mz[4];
  //   float tyreDirtyLevel[4];

  //   float camberRAD[4];
  //   float tyreRadius[4];
  //   float tyreLoadedRadius[4];

  //   float suspensionHeight[4];

  //   float carPositionNormalized;
  //   float carSlope;
  //   float carCoordinates[3];

  // };


}

function handshakeRes( buff ){

  let carName = (buff.slice(0,100)).toString().split('%')[0];
  let driverName = (buff.slice(100,200)).toString().split('%')[0];
  let identifier = fromInt32LE( buff.slice(200,204) ); // .toString().split('%')[0]);
  let version = fromInt32LE( buff.slice(204,208) ); // .toString().split('%')[0]);
  let trackName = (buff.slice(208,308)).toString().split('%')[0];
  let trackConfig = (buff.slice(308,408)).toString().split('%')[0];

  // console.json({
  //   carName: carName.length,
  //   driverName: driverName.length,
  //   identifier: identifier.length,
  //   version: version.length,
  //   trackName: trackName.length,
  //   trackConfig: trackConfig.length,
  // });

  // return;

  // .read( Buffer.from([99,0,104,0,51,0,108,0]) )
  // identifier = (new binproto()).read( identifier ).Int32LE().result;
  // version = (new binproto()).read( version ).Int32LE().result;
  // console.log( identifier ); return;

  console.line();
  console.log(' carName[50]: ['+carName+']');
  console.log(' driverName[50]: ['+driverName+']');
  console.log(' identifier[4]: ['+identifier+']');
  console.log(' version[4]: ['+version+']');
  console.log(' trackName[50]: ['+trackName+']');
  console.log(' trackConfig[50]: ['+trackConfig+']');

  return {
    carName: ' '+carName.toString('ascii'),
    driverName: ' '+driverName.toString('utf-8'),
    identifier: ' '+identifier, // .toString('utf-8'),
    version: ' '+version, // .toString('utf-8'),
    trackName: ' '+trackName.toString('utf-8'),
    trackConfig: ' '+trackConfig.toString('utf-8'),
  };

}

// let result = handshakeRes(res);
// Object.keys( result ).map((k)=>{
//   console.log( k+' '+(result[ k ]).toString('ascii') );
// });

// return;

let HANDSHAKE_SENT = false;

// AC_HANDSHAKE = Handshaker.new(identifier: 1, version: 1, operation_id: 0).to_binary_s
// AC_UPDATE = Handshaker.new(identifier: 1, version: 1, operation_id: 1).to_binary_s
// AC_SPOT = Handshaker.new(identifier: 1, version: 1, operation_id: 2).to_binary_s
// AC_DISMISS = Handshaker.new(identifier: 1, version: 1, operation_id: 3).to_binary_s

client.on('message', (data_t, info) => {
  // console.log('Data received from server : ');
  // console.info(`Received ${data_t.length} bytes from ${info.address}:${info.port}`);
  // console.json({info, data_t: data_t.toString()});
  // console.log(' data_t: '+data_t.toString());

  if( data_t.length == 408 ){
    let r = handshakeRes( data_t );
    send( UPDATE );
  }else if( data_t.length == 328 ){
    RTCarInfo( data_t );
  }

});

send( HANDSHAKE );

// HANDSHAKE RESPONSE
// struct handshackerResponse{
//   char carName[50];
//   char driverName[50];
//   int identifier;
//   int version;
//   char trackName[50];
//   char trackConfig[50];
// };

// setTimeout( () => {
//     client.close()
// }, 10000 );


