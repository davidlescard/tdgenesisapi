const fse = require('fs-extra');
const request = require('request');

let refreshFile = '../aut/tok.json';
let clientid = fse.readFileSync('../aut/client.id', 'utf8');

let token_file = fse.readFileSync('../aut/tok.json', 'utf8');
let token_JSON = JSON.parse(token_file);
let refresh_code = token_JSON.refresh_token;
// console.log(token_JSON.refresh_token);

let options = {
    url: 'https://api.tdameritrade.com/v1/oauth2/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_code,
        'access_type': 'offline',
        'client_id': `${clientid}@AMER.OAUTHAP`
    }
}

console.log(JSON.stringify(options));

request(options, function(error, response, body) {
    httpStatusCode = (response === undefined) ? 0 : response.statusCode;

    if (response.statusCode == 200) {
        oAuthReply = JSON.parse(body);
        // let refreshCode = oAuthReply.refresh_token;
        // console.log(refreshCode);
        let authJson = oAuthReply;
        authJson.timestamp = Date.now();
        fse.outputFileSync(refreshFile, JSON.stringify(authJson));
        // let token_file = fse.readFileSync('../aut/tok.json', 'utf8');
        // console.log(token_file);
        console.log('done');
    }


});
