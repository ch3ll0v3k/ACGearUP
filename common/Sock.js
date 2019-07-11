const io = require('socket.io-client');

// const PROTOHOST = 'https://thecryptogate.com:5656';
const PROTOHOST = 'http://141.135.200.102:5656';

module.exports = Sock = class{

  constructor(){

    this.socket = io( PROTOHOST, {
      reconnection: true,
      reconnect: true, 
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      secure: true, 
      rejectUnauthorized: false,
    });

    this.addEvents();

  }

  on( event, cb ){
    try{
      this.socket.on( event, cb );
      return true;
    }catch( e ){
      console.error( e );
      return false;
    }
  }

  emit( event, data ){
    try{
      this.socket.emit( event, data );
      return true;
    }catch( e ){
      console.error( e );
      return false;
    }
  }

  addEvents(){

    const self = this;

    self.socket.on('connect', (socket) => { });
    self.socket.on('connect_error', (error) => { });
    self.socket.on('reconnect', (attemptNumber) => { });
    self.socket.on('reconnect_attempt', (attemptNumber) => { });
    self.socket.on('reconnecting', (attemptNumber) => { });

    // self.socket.on('disconnect', () => { self.socket.open(); });

  }

}