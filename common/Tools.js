const chi           = require('child_process')
const fs            = require('fs');
const os            = require('os');
const _UUID         = require('generate-safe-id');
const PATH          = require('path');

module.exports = {

  async sleep(mSec){
    return new Promise( async(resolve, reject)=>{
      let timeout_t = setTimeout( async()=>{
        resolve();
        clearTimeout(timeout_t);
      }, mSec)
    });
  },

  hash( mString ){
    mString = (''+mString);
    if( console.hash && console.hash.sha256 )
      return console.hash.sha256( mString );
    return mString;
  },

  mkHash: function( raw_text ){
    try{
      return crypto.createHash('sha256').update(raw_text, 'utf8').digest('hex');
    }catch(e){
      console.error(' Tools.mkHash: Error: '+e.message);
      console.error( e );
      return false;
    }
  },

  ucFirst( mString ){
    mString = (''+mString).trim();
    return (mString.charAt(0).toUpperCase()+((mString.slice(1)).toLowerCase()));
  },

  mkdir ( path ){
    try{ 
      fs.mkdirSync( path ); return true;
    }catch( e ){ return false; }      
  },

  listDir ( path ){
    return this.readDir( path );
  },
  readDir ( path ){
    try{ 
      return fs.readdirSync( path );
    }catch( e ){
      console.error(' Tools.readDir: Error: '+e.message);
      console.error( e );
      return [];
    }
  },

  // getSSLKeys( conf, node_env ){
  //   return { 
  //     key: this.readFile( './ssl-certs/'+node_env+'/'+conf.ssl.key ),
  //     cert: this.readFile( './ssl-certs/'+node_env+'/'+conf.ssl.cert ),
  //   };
  // },
  readFile( pathToFile, encoding='utf-8' ){
    try{
      return fs.readFileSync( pathToFile, encoding );
    }catch(e){
      console.error(' Tools.readFile: Error: '+e.message);
      return false;
    }
  },
  randInt : function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randFloat : function(min, max){
    return Math.random() * (max - min + 1) + min;
  },
  newUUID : function (){
    let uuid = _UUID().replace(/[\-\_]/g,'');
    while( uuid.length != 40 ) uuid += String.fromCharCode( this.randInt( 65, 90 ) );
    return uuid;

  },
  genNewUUID : function (){
    let uuid = _UUID().replace(/[\-\_]/g,'');
    while( uuid.length != 40 ) uuid += String.fromCharCode( this.randInt( 65, 90 ) );
    return uuid;

  },
  getDate : function( time_t=false ){
    try{
      let D = new Date();
      if( time_t ) D.setTime( time_t );
      let ISO = D.toISOString().toString();
      ISO = ISO.split('T');
      return ISO[0]+' '+ISO[1].split('.')[0].trim();
    }catch(e){
      console.error(' Tools.getDate: Error: '+e.message);
      return '[date]';
    }
  },
  getDateAsFileName : function( includeSeconds=false ){
    try{

      let D = new Date();
      let ISO = D.toISOString().toString();
      ISO = ISO.split('T');
      if( includeSeconds )
        return ISO[0]+'_'+( ISO[1].split('.')[0].trim().replace(/[\:]/g, '-') );
      return ISO[0];
    }catch(e){
      console.error(' Tools.getDateAsFileName: Error: '+e.message);
      return '[date]';
    }
  },

  msTimeToDate( ms_time ){
    let D = new Date();
        D.setTime( ms_time );

    let ISO = D.toISOString().toString();
    ISO = ISO.split('T');

    let time_arr = ISO[1].split('.');

    let date = ISO[0];
    let time = time_arr[0];
    let msec = time_arr[1].replace('Z','');
    return date+' '+time+' ('+msec+') ';

  },
  timeToDate( time ){
    return msTimeToDate( time * 1000 );
  },

  getUnixTime: function(){
    return parseInt( (new Date()).getTime() /1000 );
  },
  getTimestamp: function(){
    return parseInt((new Date()).getTime()); // JS
  },
  getUnixTimeInMS: function(){
    return (new Date()).getTime();
  },

  isValidEmail: function( email ){
    let mEmailRegExp = new RegExp(/^([a-zA-Z0-9\.\-\_]){1,58}([@]{1})([a-zA-Z0-9\.\-\_]){1,58}([.]){1}(\.)?([a-zA-Z0-9\.\-\_]){1,58}$/);
    return mEmailRegExp.test( email );
  },

  isValidPwd: function( pwd, min_length=8 ){
    pwd = (''+pwd).trim();
    let inUpper = new RegExp(/([A-Z]){1,}/);
    let inLower = new RegExp(/([a-z]){1,}/);
    let digit = new RegExp(/([0-9]){1,}/);
    let symbol = new RegExp(/([\!\s\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;<\=\>\?\@\[\]\^\_`\{\|\}]){1,}/);
    return ( inLower.test(pwd) && inUpper.test(pwd) && digit.test(pwd) && symbol.test(pwd) && pwd.length >= ( min_length || 8 ) );
  },

  writeFileSync ( file, data ){
    try{ 
      file = this.getAbsPath( file );
      fs.writeFileSync( file ,data, { encoding: 'utf-8' });
      return true;
    }catch( e ){
      return false;
    }
  },

  appendFileSync ( file, data ){

    try{ 
      file = this.getAbsPath( file );
      fs.writeFileSync( file ,data, { encoding: 'utf-8', flag: 'a' });
      return true;
    }catch( e ){
      return false;
    }
  },

  appendFileAsync ( file, data, cb ){
    try{ 
      file = this.getAbsPath( file );
      fs.writeFile( file ,data, {encoding: 'utf-8', flag: 'a'}, (err, res)=>{
        cb(true);
      });
    }catch( e ){
      console.error(' #appendFileAsync: Exeption: '+e.message);
      cb(false);
    }
  },

  getFileInfo( path ){
    try{ 
      return fs.statSync(path);
    }catch( e ){
      return false;
    }
  },

  isFile( path ){
    const info = this.getFileInfo( path );
    return info && info.isFile();
  },

  isDir( path ){
    const info = this.getFileInfo( path );
    return info && info.isDirectory();
  },

  getAbsPath( relPath ){
    try{
      return PATH.resolve( relPath );
    }catch(e){
      return false;
    }
  },

  createObjectTree( mObj, maxDepth=7 ) {

    console.log(' #createObjectTree');
    let currDepth = -1;

    function _getType( mObj ){
      return (typeof mObj);
    }

    function _isObj( mObj ){
      return mObj !== null && mObj !== undefined &&  _getType( mObj ) === 'object';
    }

    function _print( pd, key, type ){
      console.log( pd+' ['+key+'] => ['+type+']' );
    }

    function _getObjKeys( mObj ){
      return Object.keys( mObj );
    }

    function _mkTree( pd, mObj, depth ){

      let keys = _getObjKeys( mObj );
      let allowNext = (depth) <= maxDepth;

      keys.map((key)=>{
        _print( pd, key, _getType( mObj[ key ] ) );
        if( _isObj( mObj[ key ] ) && allowNext ){
          _mkTree( pd+'  ', mObj[ key ], (depth+1) );
        }

      });

    }

    _mkTree( ' ', mObj, currDepth );

  },

  // async consoleConfirm( q ){
  //   return new Promise( async(resolve, reject)=>{
  //     try{
  //       const r = readline.createInterface({ input: process.stdin, output: process.stdout});
  //       r.question(q+"\n", async (answer)=>{
  //         r.close();
  //         resolve(answer);
  //       });
  //     }catch(e){
  //       console.error(' #consoleConfirm: '+e.message);
  //       resolve(false);
  //     }
  //   });
  // },

}

