class MiiCanvas{

    constructor( params ){

        this.name = params.name;
        this.canvasId = params.canvasId;
        this.W = params.W;
        this.H = params.H;
        this.CW = this.W / 2;
        this.CH = this.H / 2;

        this.GH = 10;
        this.GW = this.GH * 4;
        this.GClr = '#444';

        this.DPI = window.devicePixelRatio;
        this.canvas = this.getByID( this.canvasId );
        this.canvas.setAttribute('width', (this.W * this.DPI)+'px');
        this.canvas.setAttribute('height', (this.H * this.DPI)+'px');
        this.ctx = this.canvas.getContext("2d");

        this.offset_x = this.canvas.offsetLeft;
        this.offset_y = this.canvas.offsetTop;

        this.textIndex = 0;
        this.mainBackground = '#f7f7f7';

        this.timeout_t = null;
        this.frameRate = 1000 / 15;
        this.allowAnimate = false;
        this.onFrameCallback = null;
        this.framesCounter = 0;
        this._animationStartTime = 0;

        this.isAnimationRunning = false;
        this.isMouseDown = false;

        self.mouseDown_x = 0;
        self.mouseDown_y = 0;
        self.mouseUp_x = 0;
        self.mouseUp_y = 0;
        self.currentMouse_x = 0;
        self.currentMouse_y = 0;

        this.log = console.log;

        this.UID = this.genUID( 12 );
        window[ this.UID ] = this;


    }

    // ----------------------------------------------------------------
    // Canvas Methods

    clear(){ 
        this.ctx.clearRect(0, 0, this.W, this.H);
        this.setBackground( this.mainBackground )
        this.drawGrid();
        // this.drawText( this.name, 10, 20, '#FFF' );
    }

    setBackground( clr ){ this.setBg( clr ); }

    setBg( clr ){ 
        this.mainBackground = clr || '#848484'; 
        this.drawRect(0, 0, this.W, this.H, this.mainBackground );
    }

    drawGrid(){

        for( let wx = 0; wx < this.W; wx += this.GW ){
            this.drawLine( wx, 0, wx, this.H, this.GClr, 1 );
        }
            
        for( let hy = 0; hy < this.H; hy += this.GH ){
            this.drawLine( 0, hy, this.W, hy, this.GClr, 1 );

        }
    }

    drawDotField( x0, y0, D, clr ){
        this.ctx.beginPath();
        this.ctx.strokeStyle = clr || 'rgba(0, 128, 255, 1)';
        this.ctx.arc( x0, y0, D, 0, 2*Math.PI);
        this.ctx.stroke();
    }

    drawDot( x0, y0, D, clr ){
        this.ctx.beginPath();
        this.ctx.fillStyle = clr || 'rgba(0, 128, 255, 1)';
        this.ctx.arc( x0, y0, (D || 5), 0, 2*Math.PI);
        this.ctx.fill();
    }

    drawLine( x0, y0, x1, y1, clr, w ){
        this.ctx.beginPath();
        this.ctx.strokeStyle = clr || 'rgba(0, 128, 255, 1)';
        this.ctx.lineWidth = (w || 1);
        this.ctx.fillStyle = "rgb(0,255,0)" ;
        this.ctx.moveTo( x0, y0 );
        this.ctx.lineTo( x1, y1 );
        this.ctx.stroke();
    }

    drawRect( x0, y0, w, h, clr ){
        this.ctx.beginPath();
        this.ctx.strokeStyle = clr || 'rgb(128,128,128)';
        this.ctx.fillStyle = clr || 'rgb(128,128,128)';
        this.ctx.rect( x0, y0, w, h);
        this.ctx.fill();
        // ctx.stroke();

    }

    clearInfoTextIndex(){ this.textIndex = 0; }

    infoText( data, clr ){
        this.ctx.font = '16px monospace';
        this.ctx.fillStyle = clr || '#333';
        this.ctx.fillText( data, 30, 20+ (20 * this.textIndex));
        this.textIndex++;
    }

    drawText( data, x0, y0, clr ){
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = clr || '#333';
        this.ctx.fillText( data, x0, y0 );
    }

    // ----------------------------------------------------------------
    // Canvas Events

    onMouseDown( cb ){

        let self = this;

        self.canvas.addEventListener('mousedown', function( e ){
            // this == <canvas ...>

            self.isMouseDown = true;
            self.mouseDown_x = self.CW - (e.clientX - self.offset_x);
            self.mouseDown_y = self.CH - (e.clientY - self.offset_y);
            cb( e, self.mouseDown_x, self.mouseDown_y );
        });
        
    }

    onMouseUp( cb ){

        let self = this;

        self.canvas.addEventListener('mouseup', function( e ){
    
            self.isMouseDown = false;
            self.mouseUp_x = self.CW - (e.clientX - self.offset_x);
            self.mouseUp_y = self.CH - (e.clientY - self.offset_y);
            cb( e, self.mouseUp_x, self.mouseUp_y );

        });

    }

    onMouseMove( cb ){

        let self = this;

        self.canvas.addEventListener('mousemove', function( e ){
            self.currentMouse_x = self.CW - (e.clientX - self.offset_x);
            self.currentMouse_y = self.CH - (e.clientY - self.offset_y);
            cb( e, self.currentMouse_x, self.currentMouse_y, self.isMouseDown );
        });

    }

    // ----------------------------------------------------------------
    // Canvas Animation

    setFrameRate( FPS ){
        this.frameRate = 1000 / FPS; 
        // 1000.0 / 15.0 (FPS) == 66.66 / MSecDelay
        // 1000.0 / 24.0 (FPS) == 41.66 / MSecDelay
        // 1000.0 / 30.0 (FPS) == 33.33 / MSecDelay
        // 1000.0 / 60.0 (FPS) == 16.66 / MSecDelay

    }

    onFrame( cb ){
        this.onFrameCallback = cb || function(){ console.log(' No Frame callback was set ') };
    }

    stopAnimation(){
        this.allowAnimate = false;
        this.isAnimationRunning = false;
    }

    startAnimation(){

        if( this.isAnimationRunning ){
            // console.log(' Animation already running ...');
            return;
        }

        this.allowAnimate = true;
        this.isAnimationRunning = true;
        this.framesCounter = 0;
        this._animationStartTime = Date.now();

        // this.log( 'this.frameRate: ['+this.frameRate+']' );
        this.timeout_t = setTimeout( function( self ){ self._frame( self ); }, this.frameRate, this );

    }

    _frame( MiCan ){

        let self = MiCan;

        // console.log( self ); return;

        clearTimeout( self.timeout_t );
        if( !self.allowAnimate ){ self.log(' #allowAnimate == false'); return; }

        let mSecPast = (Date.now() - self._animationStartTime);
        let secPast  = +( mSecPast / 1000 ).toFixed(2);

        self.onFrameCallback( (++self.framesCounter), mSecPast, secPast );

        self.timeout_t = setTimeout( function( self ){ self._frame( self ); }, self.frameRate, self );

    }

    // ----------------------------------------------------------------
    // Tools

    rad2ang( rad ){ return rad * 180 / Math.PI; }
    ang2rad( ang ){ return ang * Math.PI / 180; }
    getByID( id ){ return document.getElementById( id ); }
    randInt( min, max ){ return Math.floor( Math.random() * (max - min + 1)) + min; }
    randFloat( min, max ){ return (Math.random() * (max - min + 0.001)) + min; }

    genUID(L){

        L = L ? L : 12;
        let newUID = '';
        let data = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9','a', 'b', 'c', 'd', 'e', 'f' );
        for(var i=0; i<L;i++) newUID += data[this.randInt(0, 15)];

        return '_'+newUID;
    }

}

// function onLoad( cb ) { 
//   window.addEventListener('load', function(){
//     // console.log(' onLoad: ...');
//     cb();
//   });
// }


if( typeof module !== "undefined" ){
  module.exports = MiiCanvas;
}

