
// let MiiCan = new MiiCanvas({canvasId:'my-canvas-0', W, H});
// MiiCan.setBg( '#444' );

// MiiCan.setFrameRate( 15 );
// MiiCan.onFrame(function( frame, mSecPast, secPast ){

//   try{

//     MiiCan.clear();
//     MiiCan.clearInfoTextIndex();

//     // MiiCan.drawLine( 30, 100, 200, 160, '#FF0' );
//     // MiiCan.drawDot( x, y, 2, '#aaa' );

//     for( let i in coords ){
//       MiiCan.drawDot( CW+coords[i].x, CH+coords[i].y, 2, ( coords[i].speed_tracker ? '#0F5' : '#F50' ) );
//     }
//     MiiCan.drawDot( CW+coords[ coords.length -1 ].x, CH+coords[ coords.length -1 ].y, 3, '#000' );
//   }catch(e){}

// });

// MiiCan.startAnimation();

const MiiCanvas = require('./js/MiiCanvas');

class TChart{

  constructor( params ){

    this.W = params.W;
    this.H = params.H;
    this.fgClr = (params.fgClr || '#F00');
    this.bgClr = (params.bgClr || '#111')
    this.telemetry = params.telemetry;
    this.mul_const = params.mul_const;
    this.allow_compress = ( params.allow_compress || false );
    this.data = [];
    this._initChart();

  }

  _initChart(){

    this._chart = new MiiCanvas({
      canvasId: `${this.telemetry}-canvas`, 
      W: this.W, 
      H: this.H,
      name: this.telemetry,
    });

    this._chart.setBg( this.bgClr );

  }

  setData( data ){
    this.data = data;
  }

  clear(){
    this.data = [];
    // this._chart.clear();
  }

  update(){
    this._chart.clear();

    if( this.data.length < 2 ) return;

    let xs = 0;
    let step = this.allow_compress ? (this.W / this.data.length) : 1;
    let last_val = 0;

    for( let i=0; i < (this.data.length-2); i++ ){

      let y0 = this.data[ i+0 ];
      let y1 = this.data[ i+1 ];

      this._chart.drawLine( xs, this.H-(y0*this.mul_const), (xs+step), this.H-(y1*this.mul_const), this.fgClr, 2 );
      // this._chart.drawDot( xs, y0, 1, '#fff' );
      xs += step;
      last_val = y1;

    }

    let currY = this.data[ this.data.length-1 ];
    this._chart.drawLine( 0, this.H-(currY*this.mul_const), this.W, this.H-(currY*this.mul_const), '#999', 1 );


    let currX = this.data.length * step;
    this._chart.drawLine( currX, this.H-0, currX, this.H-this.H, '#999', 1 );
  
    this._chart.drawText( `${this.telemetry}: ${ last_val }, T: ${this.data.length}`, 10, 20, '#FFF' );

    if( this.allow_compress ){

    }else{
      if( this.data.length > this.MW ) this.data.shift();
    }


  }



}



module.exports.TelChart = class{

  constructor( params ){
  
    this.MW = params.MW;    
    this.MH = params.MH;    

    this.telemetryData = {};

  }


  addChart( params={}, autoload=false ){

    if( this.telemetryData.hasOwnProperty( params.telemetry ) ){
      console.warn(` #addChart: [${ params.telemetry }] already exists ...`);
      return;
    }

    this.telemetryData[ params.telemetry ] = new TChart( {
      telemetry: params.telemetry,
      W: this.MW,
      H: Math.floor(this.MH /8),
      fgClr: params.fgClr,
      mul_const: params.mul_const,
    } );

    // console.log({telemetryData: this.telemetryData});

  }

  pushData( telemetry, data ){

    if( this.telemetryData.hasOwnProperty( telemetry ) ){
      this.telemetryData[ telemetry ].data.push( data );

      // if( this.allow_compress ){

      // }else{
      //   if( this.telemetryData[ telemetry ].data.length > this.MW ){
      //     this.telemetryData[ telemetry ].data.shift();
      //   }
      // }

      return true;
    }
    return false;

  }

  clear( telemetry=false ){

    if( telemetry && this.telemetryData.hasOwnProperty( telemetry ) ){
      this.telemetryData[ telemetry ] = this._getTelemetryDataTemplate();
      return true;
    }

    for( let key in this.telemetryData ){
      this.telemetryData[ key ] = this._getTelemetryDataTemplate();
    }

    return true;

  }

  _getTelemetryDataTemplate(){
    return {
      meta: {},
      data: [],
    }
  }

  update( telemetry=false ){

    if( telemetry && this.telemetryData.hasOwnProperty( telemetry ) ){
      this.telemetryData[ telemetry ].update();
      return true;
    }

    for( let key in this.telemetryData ){
      this.telemetryData[ key ].update();
    }

    return true;

  }

}




