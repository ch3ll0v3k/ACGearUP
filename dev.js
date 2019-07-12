// let buf = Buffer.from( [ 199, 151, 4, 0 ] );
// console.log( ((+buf.readFloatLE(0)) * 10e39).toFixed(16)  );
// console.log( (+buf.readFloatLE(0)).toFixed(16) );

const logger = require('mii-logger.js');
const binproto = require('bin-protocol');

function fromUInt8( data ){
  try{
    return (new binproto()).read( data ).UInt8().result;
  }catch( e ){ return 0;}
}

function fromInt32LE( data ){
  try{
    return (new binproto()).read( data ).Int32LE().result;
  }catch( e ){ return 0;}
}

function fromInt32BE( data ){
  try{
    return (new binproto()).read( data ).Int32BE().result;
  }catch( e ){ return 0;}
}

function fromFloatLE( data ){
  try{
    return (new binproto()).read( data ).FloatLE().result;
  }catch( e ){ return 0;}
}

function fromFloatBE( data ){
  try{
    return (new binproto()).read( data ).FloatBE().result;
  }catch( e ){ return 0;}
}



const buff = 
  // Buffer.from([0,0,0,0,7,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,106,192,0,0]);
  // 0:49:258
  // Buffer.from([0,0,0,0,12,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,247,198,0,0]);
  // 1:10:908
  Buffer.from([0,0,0,0,0,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,64,17,199,13,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,176,45,188,5,2,0,0,0,0,0,0,0,0,0,0,0,252,20,1,0]);

const seconds_f = +(+(buff.readInt32LE( 208 ) / 1000).toFixed(3));

function sec2time( timeInSeconds ) {
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60),
    milliseconds = time.slice(-3);

    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
}

console.json({
  sec2time: sec2time(seconds_f),
});

// console.json({
//   iLE: (+(buff.readInt32LE( 208 ) / 1000).toFixed(3))
// });



// for( let i=0; i< buff.length; i++ ){
//   console.log({ i, 
//     // fLE: buff.readFloatLE( i ),
//     // iLE: (buff.readInt32LE( i ) / 1000/ 60).toFixed(3),
//     // iLE: (buff.readInt32LE( i ) / 1000/ 60).toFixed(3),
//     iLE: (buff.readInt32LE( i ) / 1000).toFixed(3),
//     // iLE: buff.readInt16LE( i ),
//     // iLE: buff.readInt16BE( i ),
//     // v: fromFloatLE( buff.slice( i, i+4 ) ),
//     // v: fromInt32LE( buff.slice( i, i+4 ) ),
//   });
// }
