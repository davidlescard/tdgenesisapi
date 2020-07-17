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
app.get('/', async function(req, res){
    console.log('New request');
 
    let httpStatusCode = undefined;
    let httpErrorMsg = undefined;
    let oAuthCode = req.query.code; // get the OAuth 2.0 code from the request URL
    let oAuthReply = undefined;
    let refreshFile = '../aut/tok.json';
//     // 
//     // [4] POST request for obtaining OAuth 2.0 access token with code
//     //
//     let options = {
//         url: 'https://api.tdameritrade.com/v1/oauth2/token',
//         method: 'POST',
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         form: {
//             'grant_type': 'authorization_code',
//             'access_type': 'offline',
//             'code': oAuthCode,
//             'client_id': `${clientid}@AMER.OAUTHAP`,
//             'redirect_uri': 'https://localhost:8443'
//         }
//     }
//     // 
//     // [5] Make POST request
//     //
//     request(options, function(error, response, body) {
//         httpStatusCode = (response === undefined) ? 0 : response.statusCode;
//         httpErrorMsg = error;
//         css = "style=\"overflow-wrap: break-word; width: 800px;\"";
 
//         if (response.statusCode == 200) {
//             oAuthReply = JSON.parse(body);
//             let refreshCode = oAuthReply.refresh_token;
//             console.log(refreshCode);
//             fse.outputFileSync(refreshFile, JSON.stringify(oAuthReply));
//             console.log('done');
//         }
 
//         let html = "<html><body>done</body></html>";
//         res.send(html);

//     });
 
// });

    const getAuthorizationCode = oauth.client(axios.create(), {
        url: 'https://api.tdameritrade.com/v1/oauth2/token',
        grant_type: 'authorization_code',
        client_id: `${clientid}@AMER.OAUTHAP`,
        client_secret: 'bar',
        redirect_uri: '...',
        code: oAuthCode,
        scope: 'baz',
    });

    const auth = await getAuthorizationCode();

    console.log(auth);

    let html = "<html><body>done</body></html>";
    res.send(html);
});

/*
51821074
https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%3A8443&client_id=JWOOKNYCAEJLUKYA19FFAF0I1FV4Z4RC%40AMER.OAUTHAP

*/

/*
Axios OAuth 2.0 Client
Authorization Code grant
const axios = require('axios');
const oauth = require('axios-oauth-client');
const getAuthorizationCode = oauth.client(axios.create(), {
  url: 'https://oauth.com/2.0/token',
  'grant_type': 'authorization_code',
  'access_type': 'offline',
  'code': oAuthCode,
  'client_id': `${clientid}@AMER.OAUTHAP`,
  'redirect_uri': 'https://localhost:8443'
});
const auth = await getAuthorizationCode(); // => { "access_token": "...", "expires_in": 900, ... }

Owner Credentials grant
const axios = require('axios');
const oauth = require('axios-oauth-client');
const getOwnerCredentials = oauth.client(axios.create(), {
  url: 'https://oauth.com/2.0/token',
  grant_type: 'password',
  client_id: 'foo',
  client_secret: 'bar',
  username: 'asdf',
  password: 'yuio',
  scope: 'baz'
}); 
const auth = await getOwnerCredentials(); // => { "access_token": "...", "expires_in": 900, ... }

Client Credentials grant
const axios = require('axios');
const oauth = require('axios-oauth-client');
const getClientCredentials = oauth.client(axios.create(), {
  url: 'https://oauth.com/2.0/token',
  grant_type: 'client_credentials',
  client_id: 'foo',
  client_secret: 'bar',
  scope: 'baz'
});
const auth = await getClientCredentials(); // => { "access_token": "...", "expires_in": 900, ... }

Refresh Token grant
const axios = require('axios');
const oauth = require('axios-oauth-client');
const getRefreshToken = oauth.client(axios.create(), {
  url: 'https://oauth.com/2.0/token',
  grant_type: 'refresh_token',
  client_id: 'foo',
  client_secret: 'bar',
  refresh_token: '...',
  scope: 'baz'
});
const auth = await getRefreshToken(); // => { "access_token": "...", "refresh_token": "...", "expires_in": 900, ... }

Axios OAuth 2.0 Authentication interceptor
const axios = require('axios');
const oauth = require('axios-oauth-client');
const tokenProvider = require('axios-token-interceptor');
 
const getOwnerCredentials = oauth.client(axios.create(), {
  // see example above
})
 
const instance = axios.create();
instance.interceptors.request.use(
  // Wraps axios-token-interceptor with oauth-specific configuration,
  // fetches the token using the desired claim method, and caches
  // until the token expires
  oauth.interceptor(tokenProvider, getOwnerCredentials)
);
*/
