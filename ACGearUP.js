// const logger = require('mii-logger.js');
// console.logTime( false );
// console.logColor( false );

const binproto = require('bin-protocol');
const dgram = require('dgram');
const events = require('events');

const HANDSHAKE = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(0).result;
const UPDATE = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(1).result;
const SPOT = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(2).result;
const DISMISS = (new binproto()).write().Int32LE(1).Int32LE(1).Int32LE(3).result;

// Silverstone - GP
// X: -442.2 <=> 502.4
// Y: -5.4 <=> 4.5
// Z: -883.6 <=> 875.

module.exports = class{

  constructor( host=false, port=9996 ){

    // console.log({host, port});

    if( !host ){
      alert('Please provide IP Address of PS4');
      return;
    }

    let self = this;

    this.eventEmitter = new events.EventEmitter();

    this.host = host; 
    this.port = port; 
    this.handshakeInfo = {};
    this.isConnected = false;
    this.socket_car = dgram.createSocket('udp4');
    this.socket_lap = dgram.createSocket('udp4');

    // const _212b = [0,0,0,0,0,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,187,230,1,0];

    let time_t = Date.now();

    this.speed_tracker = 0;
    this.avg_speed = 0;
    this.avg_speed_div = 0;

    this.car = {
      rpm: {max: 0, curr: 0,},
      speed: {max: 0, curr: 0,},
      coords: {
        x: {min: 0, max:0, curr:0,},
        y: {min: 0, max:0, curr:0,},
        z: {min: 0, max:0, curr:0,},
      },
    };

    this.socket_car.on('message', (data_t, info)=>{
      self.onMessage( 'car' , data_t, info );
    });

    this.socket_lap.on('message', (data_t, info)=>{
      self.onMessage( 'lap' , data_t, info );
    });

    this.connect( this );
    // console.log({RTLap: this.getRTLap( Buffer.from([0,0,0,0,7,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,106,192,0,0]) )});

    // setTimeout( ()=>{
    //   console.log(' => emit ...');
    //   self.getRTLap( Buffer.from([0,0,0,0,7,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,106,192,0,0]));
    //   self.getRTLap( Buffer.from([0,0,0,0,7,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,106,192,0,0]));
    //   self.getRTLap( Buffer.from([0,0,0,0,7,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,106,192,0,0]));
    // }, 2500)

  }

  connect( self ){
    try{

      self.send( 'car', HANDSHAKE );
      self.send( 'lap', HANDSHAKE );

    }catch( e ){
      console.warn( ' #connect: exception: '+e.message );
      console.error( e );
      setTimeout( (self)=>{ self.connect() }, 2500, self );
    }
  }

  on( event, cb ){
    try{
      this.eventEmitter.on( event, cb );
    }catch( e ){
      console.log( e );
    }
  }

  onMessage( socket, data_t, info ){

    try{

      if( socket == 'car' && this.time_t > Date.now() ){
        return;
      }

      this.time_t = Date.now() + (1000/24);

      // console.log('Data received from server : ');
      // console.info(` onMessage: [${socket}] res: ${data_t.length} b, ${info.address}:${info.port}`);
      // console.json({info, data_t: data_t.toString()});
      // console.log(' data_t: '+data_t.toString());

      if( data_t.length == 408 ){ // HANDSHAKE-META
        this.handshakeInfo = this.handshakeRes( data_t );
        console.log({socket, data_t: this.handshakeInfo});

        switch( (''+socket).trim().toLowerCase() ){
          case 'lap': this.send( 'lap', SPOT ); break;
          case 'car': this.send( 'car', UPDATE ); break;
        }

      }else if( data_t.length == 212 ){ // LAP-META
        // console.info(' >>> ');
        // console.log( JSON.stringify(data_t) );
        let RTLap = this.getRTLap( data_t );
        console.table({RTLap});
        // [0,0,0,0,0,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,187,230,1,0]

      }else if( data_t.length == 328 ){ // CAR-META
        let RTCarInfo = this.getRTCarInfo( data_t );
        // Update UI ...
        // console.log( 'speed_Kmh: '+packet.speed_Kmh );
      }else{
        alert(' onMessage: Warn ...');
        console.warn(' Warn ... ');
        console.log({socket, data_t});
      }

    }catch( e ){
      console.warn( ' #onMessage: exception: '+e.message );
      console.error( e );
    }
  }

  handshakeRes( buff ){
    try{

      let carName = this.bufferToUTF( (buff.slice(0,100)) /*.toString().split('%')[0]*/ );
      let driverName = this.bufferToUTF( (buff.slice(100,200)) /*.toString().split('%')[0]*/ );
      let identifier = this.fromInt32LE( buff.slice(200,204) ); // .toString().split('%')[0]);
      let version = this.fromInt32LE( buff.slice(204,208) ); // .toString().split('%')[0]);
      let trackName = this.bufferToUTF( (buff.slice(208,308)) /*.toString().split('%')[0]*/ );
      let trackConfig = this.bufferToUTF( (buff.slice(308,408)) /*.toString().split('%')[0]*/ );

      // console.line();
      console.log(' carName[50]: ['+carName+']');
      console.log(' driverName[50]: ['+driverName+']');
      console.log(' identifier[4]: ['+identifier+']');
      console.log(' version[4]: ['+version+']');
      console.log(' trackName[50]: ['+trackName+']');
      console.log(' trackConfig[50]: ['+trackConfig+']');

      this.eventEmitter.emit( 'titleChanged', carName+' @'+trackName+', '+driverName );
      this.eventEmitter.emit( 'meta', {carName, trackName, driverName, trackConfig} );

      return {
        carName: ' '+carName, // .toString('ascii'),
        driverName: ' '+driverName, // .toString('utf-8'),
        identifier: ' '+identifier, // , // .toString('utf-8'),
        version: ' '+version, // , // .toString('utf-8'),
        trackName: ' '+trackName, // .toString('utf-8'),
        trackConfig: ' '+trackConfig, // .toString('utf-8'),
      };

    }catch( e ){
      console.warn( ' #handshakeRes: exception: '+e.message );
      console.error( e );
      return {};
    }
  }

  send( socket, buffs ){
    try{

      this[ `socket_${socket}` ].send( buffs, this.port, this.host, error => {
        if (error) {
          console.log(error)
          this[ `socket_${socket}` ].close();
          // alert( error );
        } else {
          // console.log(' send: socket: ['+socket+'] ...');
        }
      });
    }catch( e ){
      console.warn( ' #send: exception: '+e.message );
      console.error( e );
      alert( ' Error: '+e.message );
    }
  }

  getGear( gear ){
    try{
      if( (+gear[0]) == 0 ) return 'R';
      if( (+gear[0]) == 1 ) return 'N';
      return (+gear[0]) -1;      
    }catch( e ){
      return '*';
    }
  }

  // tools
  fromUInt8( data ){
    try{
      return (new binproto()).read( data ).UInt8().result;
    }catch( e ){ return 0;}
  }

  fromInt32LE( data ){
    try{
      return (new binproto()).read( data ).Int32LE().result;
    }catch( e ){ return 0;}
  }

  fromInt32BE( data ){
    try{
      return (new binproto()).read( data ).Int32BE().result;
    }catch( e ){ return 0;}
  }

  fromFloatLE( data ){
    try{
      return (new binproto()).read( data ).FloatLE().result;
    }catch( e ){ return 0;}
  }

  fromFloatBE( data ){
    try{
      return (new binproto()).read( data ).FloatBE().result;
    }catch( e ){ return 0;}
  }

  unpackArray( array, dType, fromByte, bytesType, items ){

    try{

      let data = [];
      const upto = fromByte + ( bytesType * items );
      const MAX_RQ = 100;
      let CURR_RQ = 0;
      while( fromByte < upto ){
        switch( dType ){
          case 'float':
            data.push( this.fromFloatLE( array.slice( fromByte, (fromByte+bytesType) ) ) );
            break;
          case 'int':
            data.push( this.fromInt32LE( array.slice( fromByte, (fromByte+bytesType) ) ) );
            break;
        }

        if( (++CURR_RQ) >= MAX_RQ ) return [];
        fromByte += bytesType;
      }
      return data;

    }catch( e ){
      console.warn( ' #unpackArray: exception: '+e.message );
      console.error( e );
      return [];
    }
  }

  getRTLap( _212b ){

    try{

      const time_t = this.sec2time( +(+(_212b.readInt32LE( 208 ) / 1000).toFixed(3)) );

      const RTLap = {
        // int 
        carIdentifierNumber: this.fromInt32LE( _212b.slice(0,4) ),
        // int 
        lap: (this.fromInt32LE( _212b.slice(4,8) )) +2,
        // char [50]
        driverName: this.bufferToUTF( _212b.slice(8,108) ),
        // char [50] 
        carName: this.bufferToUTF( _212b.slice(108,208) ),
        // float
        time_sec: (+time_t.seconds),
        // string
        time_formated: time_t.formated,

        avg_speed: +( this.avg_speed / this.avg_speed_div ).toFixed(3),

      };

      this.avg_speed = 0;
      this.avg_speed_div = 0;

      this.eventEmitter.emit('lap', RTLap );
      return RTLap;

    }catch( e ){
      console.warn( ' #getRTLap: exception: '+e.message );
      console.error( e );
      return {};
    }
  }

  getRTCarInfo( _328b ){

    // {"type":"Buffer","data":[97,0,0,0,72,1,0,0,29,26,200,58,222,172,120,58,232,85,222,57,1,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,12,112,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,186,13,62,108,97,160,68,95,93,111,5,2,0,0,0,176,93,14,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,149,253,10,61,237,39,210,187,87,62,143,189,141,181,145,189,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,10,147,55,238,167,18,57,52,216,164,59,201,11,164,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,148,122,34,60,155,250,190,60,83,233,15,61,205,178,5,61,173,30,213,68,150,94,52,69,21,178,42,69,111,152,218,68,101,199,131,63,100,77,139,63,248,173,145,63,155,202,162,63,84,108,231,185,147,221,175,188,116,199,155,59,171,234,216,58,206,252,137,61,0,0,0,0,0,0,0,0,0,0,0,0,105,82,228,59,30,213,9,189,250,13,29,188,198,87,93,187,188,116,147,62,188,116,147,62,188,116,147,62,188,116,147,62,33,154,144,62,214,159,142,62,35,29,143,62,94,174,144,62,144,85,43,61,64,39,119,61,24,110,104,61,8,161,50,61,165,215,95,61,0,0,0,0,255,218,43,195,80,89,55,192,232,233,185,65]};

    // return;

    try{

      const data = {
        // char
        identifier:  _328b.slice( 0, 2 ),
        // int
        size: this.fromInt32LE( _328b.slice( 2, 6 ) ),
        // float
        speed_Kmh: this.fromFloatLE( _328b.slice( 6+2, 10+2 ) ),
        // float
        speed_Mph: this.fromFloatLE( _328b.slice( 12, 16 ) ),
        // float
        speed_Ms: this.fromFloatLE( _328b.slice( 16, 20 ) ),
        // console.log( {speed_Kmh} ); return;

        // bool
        isAbsEnabled: +this.fromUInt8( _328b.slice( 20, 21 ) ),
        // bool
        isAbsInAction: +this.fromUInt8( _328b.slice( 21, 22 ) ),
        // bool
        isTcInAction: +this.fromUInt8( _328b.slice( 22, 23 ) ),
        // bool
        isTcEnabled: +this.fromUInt8( _328b.slice( 23, 24 ) ),
        // bool
        isInPit: +this.fromUInt8( _328b.slice( 24, 25 ) ),
        // bool
        isEngineLimiterOn: +this.fromUInt8( _328b.slice( 25, 26 ) ),

        // console.json({ isAbsEnabled, isAbsInAction, isTcInAction, isTcEnabled, isInPit, isEngineLimiterOn });
        // return

        // float
        accG_vertical: this.fromFloatLE( _328b.slice( 26, 30 ) ),
        // float
        accG_horizontal: this.fromFloatLE( _328b.slice( 30, 34 ) ),
        // float
        accG_frontal: this.fromFloatLE( _328b.slice( 34, 38 ) ),
        // console.json({ accG_vertical, accG_horizontal, accG_frontal, });
        // return;

        // int
        lapTime: this.fromInt32LE( _328b.slice( 38, 42 ) ),
        // int
        lastLap: this.fromInt32LE( _328b.slice( 42, 46 ) ),
        // int
        bestLap: this.fromInt32LE( _328b.slice( 46, 50 ) ),
        // int
        lapCount: this.fromInt32LE( _328b.slice( 50, 54 ) ),
        // console.json({ lapTime, lastLap, bestLap, lapCount });
        // return;

        // float
        gas: this.fromFloatLE( _328b.slice( 54+2, 58+2 ) ),
        // float
        brake: this.fromFloatLE( _328b.slice( 58+2, 62+2 ) ),
        // float
        clutch: this.fromFloatLE( _328b.slice( 62+2, 66+2 ) ),
        // float
        engineRPM: this.fromFloatLE( _328b.slice( 66+2, 70+2 ) ),
        // float
        steer: this.fromFloatLE( _328b.slice( 70+2, 74+2 ) ),
        // console.log({ gas, brake, clutch, engineRPM, steer }); return;

        // int
        gear: this.getGear( _328b.slice( 76, 77 ) ),
        // console.log({gear}); return;

        // float
        cgHeight: this.fromFloatLE( _328b.slice( 80, 84 ) ),

        // float [4]
        wheelAngularSpeed: this.unpackArray( _328b, 'float', 84, 4, 4 ),
        // console.json({wheelAngularSpeed}); return;

        // float [4]
        slipAngle: this.unpackArray( _328b, 'float', 100, 4, 4 ),
        // float [4]
        slipAngle_ContactPatch: this.unpackArray( _328b, 'float', 116, 4, 4 ),
        // float [4]
        slipRatio: this.unpackArray( _328b, 'float', 132, 4, 4 ),
        // float [4]
        tyreSlip: this.unpackArray( _328b, 'float', 148, 4, 4 ),
        // float [4]
        ndSlip: this.unpackArray( _328b, 'float', 164, 4, 4 ),
        // float [4]
        load: this.unpackArray( _328b, 'float', 180, 4, 4 ),
        // float [4]
        Dy: this.unpackArray( _328b, 'float', 196, 4, 4 ),
        // float [4]
        Mz: this.unpackArray( _328b, 'float', 212, 4, 4 ),
        // console.json({ slipAngle, slipAngle_ContactPatch, slipRatio, tyreSlip, ndSlip, load, Dy, Mz }); return;

        // float [4]
        tyreDirtyLevel: this.unpackArray( _328b, 'float', 228, 4, 4 ),
        // console.json({ tyreDirtyLevel }); return;

        // float [4]
        camberRAD: this.unpackArray( _328b, 'float', 228+16, 4, 4 ),
        // float [4]
        tyreRadius: this.unpackArray( _328b, 'float', 228+32, 4, 4 ),
        // float [4]
        tyreLoadedRadius: this.unpackArray( _328b, 'float', 228+48, 4, 4 ),
        // float [4]
        suspensionHeight: this.unpackArray( _328b, 'float', 228+64, 4, 4 ),
        // console.json({ camberRAD, tyreRadius, tyreLoadedRadius, suspensionHeight });

        // float
        carPositionNormalized:  this.fromFloatLE( _328b.slice( 228+64+16, 228+64+16+4 ) ),
        // float
        carSlope:  this.fromFloatLE( _328b.slice( 228+64+20, 228+64+20+4 ) ),
        // float [3]
        carCoordinates: this.unpackArray( _328b, 'float', 228+64+20+4, 4, 3 ),
        // console.json({carCoordinates});
      };

      // console.log( data.Mz );
      // console.log( data.load );


      this.avg_speed_div++;
      this.avg_speed += (+data.speed_Kmh);

      this.car.coords.x.max = (+data.carCoordinates[0]) > this.car.coords.x.max ? (+data.carCoordinates[0]) : this.car.coords.x.max; 
      this.car.coords.x.min = (+data.carCoordinates[0]) < this.car.coords.x.min ? (+data.carCoordinates[0]) : this.car.coords.x.min; 
      this.car.coords.x.curr = (+data.carCoordinates[0]);

      this.car.coords.z.max = (+data.carCoordinates[1]) > this.car.coords.z.max ? (+data.carCoordinates[1]) : this.car.coords.z.max; 
      this.car.coords.z.min = (+data.carCoordinates[1]) < this.car.coords.z.min ? (+data.carCoordinates[1]) : this.car.coords.z.min; 
      this.car.coords.z.curr = (+data.carCoordinates[1]);

      this.car.coords.y.max = (+data.carCoordinates[2]) > this.car.coords.y.max ? (+data.carCoordinates[2]) : this.car.coords.y.max; 
      this.car.coords.y.min = (+data.carCoordinates[2]) < this.car.coords.y.min ? (+data.carCoordinates[2]) : this.car.coords.y.min; 
      this.car.coords.y.curr = (+data.carCoordinates[2]);

      this.car.rpm.curr = (+data.engineRPM);
      this.car.speed.curr = (+data.speed_Kmh);

      if( this.car.rpm.curr > this.car.rpm.max ) this.car.rpm.max = this.car.rpm.curr;
      if( this.car.speed.curr > this.car.speed.max ) this.car.speed.max = this.car.speed.curr;

      this.eventEmitter.emit('rpm', {...this.car.rpm})
      this.eventEmitter.emit('speed', {...this.car.speed})
      this.eventEmitter.emit('gear', data.gear);

      this.eventEmitter.emit('coords', {
        coords: this.car.coords,
        speed_tracker: ( this.speed_tracker > (+data.speed_Kmh) ) ? false : true,
      });

      this.speed_tracker = (+data.speed_Kmh);

      this.eventEmitter.emit('params', {
        isAbsEnabled: data.isAbsEnabled,
        isAbsInAction: data.isAbsInAction,
        isTcInAction: data.isTcInAction,
        isTcEnabled: data.isTcEnabled,
        isInPit: data.isInPit,
        isEngineLimiterOn: data.isEngineLimiterOn,
      });

      return data;

    }catch( e ){
      console.warn( ' #getRTCarInfo: exception: '+e.message );
      console.error( e );
      return {};
    }

  }

  bufferToUTF( buff ){
    try{

      buff = typeof buff === 'string' ? buff.trim().split() : buff;

      let str = '';
      for( let i=0; i<buff.length; i+=2 ){
        if( (+buff[ i ])+1 == 37+1 )
          break;
        str += String.fromCharCode( (+buff[ i ]) );
      }

      // let str = '';
      // for( let i=0; i<buff.length; i+=2 ){
      //   if( (+buff[ i ])+1 == 37+1 )
      //     break;
      //   str += String.fromCharCode( (+buff[ i ]) );
      // }

      // return str.toString('ascii');
      return str.toString('utf-8');
    }catch( e ){
      console.error( e );
      return '[bufferToUTF:error]';
    }
  }

  sec2time( sec ){

    try{
      let pad = function(num, size) { return ('000' + num).slice(size * -1); },
      time = parseFloat(sec).toFixed(3),
      hours = Math.floor(time / 60 / 60),
      minutes = Math.floor(time / 60) % 60,
      seconds = Math.floor(time - minutes * 60),
      milliseconds = time.slice(-3);

      return {
        seconds: time,
        formated: pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3),
      };

    }catch( e ){
      console.error( e );
      return '[sec2time:error]';
    }
  }

}

// return;

// struct RTLap {
//   int carIdentifierNumber;
//   int lap;
//   char driverName[50];
//   char carName[50];
//   int time;
// };

// const logger = require('mii-logger.js');
// const _212b = [0,0,0,0,0,0,0,0,99,0,104,0,51,0,108,0,108,0,108,0,48,0,118,0,51,0,107,0,37,0,0,0,0,171,125,4,2,0,0,0,160,43,218,190,46,189,187,51,107,152,103,191,0,0,0,0,180,84,78,51,0,0,128,63,249,237,158,51,0,0,0,0,107,152,103,63,46,222,76,178,160,43,218,190,0,0,0,0,48,14,1,195,17,63,28,193,153,244,185,195,0,0,128,63,2,47,148,194,107,0,115,0,95,0,102,0,101,0,114,0,114,0,97,0,114,0,105,0,95,0,52,0,56,0,56,0,95,0,103,0,116,0,51,0,37,0,242,50,0,0,0,0,32,200,140,239,7,0,0,0,121,86,101,50,0,0,0,0,48,200,140,239,7,0,0,0,85,142,68,50,0,0,0,0,0,0,73,0,84,0,0,0,208,212,143,12,2,0,0,0,0,0,0,0,0,0,0,0,187,230,1,0];
// const buff = Buffer.from( _212b );
// const mACGearUP = new ACGearUP();

// const RTLap = {
//   // int 
//   carIdentifierNumber: mACGearUP.fromInt32LE( _212b.slice(0,4) ),
//   // int 
//   lap: mACGearUP.fromInt32LE( _212b.slice(4,8) ),
//   // char [50]
//   driverName: mACGearUP.bufferToUTF( _212b.slice(8,108) ),
//   // char [50] 
//   carName: mACGearUP.bufferToUTF( _212b.slice(108,208) ),
//   // int 
//   time_iLE: mACGearUP.fromInt32LE( _212b.slice(208, 212) ),
//   time_iBE: mACGearUP.fromInt32BE( _212b.slice(208, 212) ),
//   time_f: mACGearUP.fromFloatLE( _212b.slice(208, 212) ),
//   time_raw: ( _212b.slice(208, 212) ),
// };

// console.json({ RTLap });

