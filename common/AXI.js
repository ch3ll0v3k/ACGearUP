const axios = require('axios');
const http = require('http');
const https = require('https');

module.exports = AXI = class{

  constructor( base='' ){
    this.base = base;
  }

  async post( path, params={}, headers={} ){
    return new Promise( async(resolve, reject)=>{
      try{

        const res = await axios({
          url: (this.base + path),
          method: 'POST',
          headers: headers,
          data: params,
          responseType: 'json',
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });

        if( (+res.status) !== 200 ){
          resolve({code: (+res.status), msg: res.statusText, data: res.data});
          return;
        }

        resolve({code: 200, msg: 'OK', data: res.data});
        // resolve(res.data); // res.data == {code:0, ...};

      }catch(e){
        console.warn(' #post: ['+this.base+path+'] '+e.message);
        resolve({code: 500, msg: e.message, data:null});
      }
    });
  }

  async get( path, params={}, headers={} ){

    return new Promise( async(resolve, reject)=>{

      let query = '';

      try{

        Object.keys(params).map((key)=>{ query += key+'='+params[key]+'&' });

        const res = await axios({
          url: (this.base + path + (query ? '?'+query : '')),
          method: 'GET',
          headers: headers,
          // data: params,
          responseType: 'json',
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });

        if( (+res.status) !== 200 ){
          resolve({code: (+res.status), msg: res.statusText, data: res.data});
          return;
        }

        resolve({code: 200, msg: 'OK', data: res.data});
        // resolve(res.data); // res.data == {code:0, ...};

      }catch(e){
        console.warn(' #get: ['+this.base+path+query+'] '+e.message);
        resolve({code: 500, msg: e.message, data:null});
      }
    });
  }

}

