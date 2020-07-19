const fse = require('fs-extra');
const request = require('request');

let refreshFile = '../aut/tok.json';
let responseFile = '../aut/response.json';
let clientid = fse.readFileSync('../aut/client.id', 'utf8');
let content_type = 'application/json';
let quoteUrl = 'https://api.tdameritrade.com/v1/marketdata/chains';

let token_file = fse.readFileSync(refreshFile, 'utf8');
let token_JSON = JSON.parse(token_file);
let access_code = 'Bearer ' + token_JSON.access_token;
// console.log(access_code);

/* refresh token if greater than 30 min */
let elapsed = Date.now() - token_JSON.timestamp;
if (elapsed / 1000 > 29 * 60 ) {
    // console.log(elapsed);
    // console.log(token_JSON.timestamp);
    // console.log('fetching new access token');
    require('./index.access');
    // console.log('hopefully got new access token');
}

let ticker = 'T';

let options = {
    url: quoteUrl,
    headers: { 
        'Content-Type': content_type,
        'Authorization':  access_code
    },
    qs: {
        symbol: ticker,
        apikey: clientid
    }
}

request.get(options, function(error, response, body) {
    httpStatusCode = (response === undefined) ? 0 : response.statusCode;

    if (response.statusCode == 200) {
        let optionsChain = JSON.stringify(body);
        console.log(optionsChain);
    } else {
        fse.outputFileSync(responseFile, JSON.stringify(response));
        console.log(httpStatusCode);
        console.log(body);
    }

});
