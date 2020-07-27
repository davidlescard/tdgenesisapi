const fse = require('fs-extra');
const join = require('path').join;
const request = require('request');
const CONSTANTS = require('../td/constants');

// let refreshFile = '../aut/tok.json';
let refreshFile = join('../', CONSTANTS.auth.refreshFile);
let responseFile = join('../', CONSTANTS.auth.responseFile)
let clientid = fse.readFileSync(join('../', CONSTANTS.auth.clientid), 'utf8');
const content_type = CONSTANTS.applicationjson;
const baseUrl = CONSTANTS.baseUrl;
const tokenUrl = join(baseUrl, CONSTANTS.auth.tokenUrl);
const quoteUrl = join(baseUrl, CONSTANTS.option.chainsUrl);

let token_file = fse.readFileSync(refreshFile, 'utf8');
let token_JSON = JSON.parse(token_file);
let access_code = 'Bearer ' + token_JSON.access_token;
let refresh_code = token_JSON.refresh_token;
// console.log(access_code);

/* refresh token if greater than 30 min */
let elapsed = Date.now() - token_JSON.timestamp;
if (elapsed / 1000 > 29 * 60 ) {
    // console.log(elapsed);
    // console.log(token_JSON.timestamp);
    console.log('fetching new access token');
    require('./index.access');
    refreshFile = '../aut/tok.json';
    console.log('hopefully got new access token');
}

class Session {
    constructor() {
        this.access_code;
        this.refresh_code;
    }

    generateAccessCode() {
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
    }

} 

module.exports = Session;