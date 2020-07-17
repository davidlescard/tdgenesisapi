// const fs = require('fs');
const fse = require('fs-extra');
const https = require('https');
const request = require('request');
const axios = require('axios');
const oauth = require('axios-oauth-client');
//
// [1] Load SSL certificate and private key from files
//
let privateKey  = fse.readFileSync('../aut/key.pem', 'utf8');
let certificate = fse.readFileSync('../aut/cert.pem', 'utf8');
let clientid = fse.readFileSync('../aut/client.id', 'utf8');
let credentials = {key: privateKey, cert: certificate};
 
let express = require('express');
let app = express();

//
// [2] Start a secure web server and listen on port 8443
//
let httpsServer = https.createServer(credentials, app);
console.log("Listening on port 8443...");
httpsServer.listen(8443);
// 
// [3] Handle HTTPS GET requests at https://localhost:8443
// 
app.get('/', function(req, res){
    console.log('New request');
 
    let httpStatusCode = undefined;
    let httpErrorMsg = undefined;
    let oAuthCode = req.query.code; // get the OAuth 2.0 code from the request URL
    let oAuthReply = undefined;
    let refreshFile = '../aut/tok.json';
    let msg;

    axios.request({
      method: "post",
      url: "/v1/oauth2/token",
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      baseURL: "https://api.tdameritrade.com/",
      data: {
        'grant_type': 'authorization_code',
        'access_type': 'offline',
        'code': oAuthCode,
        'client_id': `${clientid}@AMER.OAUTHAP`,
        'redirect_uri': 'https://localhost:8443'  
      }
    }).then(response => {
      console.log(response);
      let refreshFile = '../aut/response.txt';
      fse.outputFileSync(refreshFile, JSON.stringify(response));
      // httpStatusCode = (response === undefined) ? 0 : response.statusCode;
      // console.log('status code ' + response.statusCode);
      // if (response.statusCode == 200) {
      //     oAuthReply = JSON.parse(body);
      //     let refreshCode = oAuthReply.refresh_token;
      //     console.log(refreshCode);
      //     fse.outputFileSync(refreshFile, JSON.stringify(oAuthReply));
      //     console.log('done');
      // }
      // console.log(response);  
    }).catch(function (error) {
      console.error('Error ' + error.message)
      console.error(error);
    });

    let html = "<html><body>done</body></html>";
    res.send(html);
    // res.send(msg);
});

/*
51821074
https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%3A8443&client_id=JWOOKNYCAEJLUKYA19FFAF0I1FV4Z4RC%40AMER.OAUTHAP

*/

