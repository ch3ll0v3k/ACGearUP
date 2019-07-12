const { Notification } = require('electron');

module.exports = Notif = class{
  constructor( P ){
    P.title = ( P.title || 'ACGearUp' );
    P.body = ( P.body || P.msg || P.text || 'Test message ...' );
    P.silent = ( P.silent || false );
    P.icon = ( P.icon || process.env.ICON );
    this.Notification = new Notification( P );
    if( !P.show && P.show === undefined ) this.Notification.show();
  }
}
