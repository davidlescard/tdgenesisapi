// const fs = require('fs');
const fse = require('fs-extra');
const https = require('https');
const request = require('request');
//
// [1] Load SSL certificate and private key from files
//
let privateKey  = fse.readFileSync('../aut/key.pem', 'utf8');
let certificate = fse.readFileSync('../aut/cert.pem', 'utf8');
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
    // 
    // [4] POST request for obtaining OAuth 2.0 access token with code
    //
    let options = {
        url: 'https://api.tdameritrade.com/v1/oauth2/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: {
            'grant_type': 'authorization_code',
            'access_type': 'offline',
            'code': oAuthCode,
            'client_id': 'JWOOKNYCAEJLUKYA19FFAF0I1FV4Z4RC@AMER.OAUTHAP',
            'redirect_uri': 'https://localhost:8443'
        }
    }
    // 
    // [5] Make POST request
    //
    request(options, function(error, response, body) {
        httpStatusCode = (response === undefined) ? 0 : response.statusCode;
        httpErrorMsg = error;
        // css = "style=\"overflow-wrap: break-word; width: 800px;\"";
 
        if (response.statusCode == 200) {
            oAuthReply = JSON.parse(body);
            let refreshCode = oAuthReply.refresh_token;
            console.log(refreshCode);
            let authJson = JSON.stringify(oAuthReply);
            authJson.date = Date.now();
            fse.outputFileSync(refreshFile, authJson);
            console.log('done');
        }
        //
        // [6] Return view, showing the OAuth 2.0 code and access token
        //
        // let html = 
        // "<html><body style=\"font-family: monospace;\"><table>" +
        //   "<tr><td width=\"150\">Status</td><td>" + httpStatusCode + "</td></tr>" +
        //   "<tr><td>OAuth 2.0 Code</td><td><div " + css + ">" + oAuthCode + "</div></td></tr>" +
        //   //"<tr><td>OAuth 2.0 Token</td><td><div " + css + ">" + oAuthReply.access_token + "</div></td></tr>" +
        //   "<tr><td>Full Response</td><td><div " + css + ">" + JSON.stringify(oAuthReply, null, 4) + "</div></td></tr>" +
        // "</table></body></html>";
 
        let html = "<html><body>done</body></html>";
        res.send(html);

    });
 
    function errorHandler (err, req, res, next) {
        res.status(500)
        res.render('error', { error: err })
    }
});

/*
    1. run 'node index.auth.js'
    2. paste and go the url
    3. login with acct

51821074
https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%3A8443&client_id=JWOOKNYCAEJLUKYA19FFAF0I1FV4Z4RC%40AMER.OAUTHAP

*/

