const fse = require('fs-extra');
const request = require('request');
const RefreshAuth = require('./lib/td/auth/RefreshAuth');
const LoadedAuth = require('./lib/td/auth/LoadedAuth');
const constants = require('./lib/td/constants.json');

RefreshAuth.evaluateAndDo().then(() => {

    let authDeets = new LoadedAuth();
    let responseFile = constants.auth.responseFile;


    let ticker = 'T';

    let options = {
        baseUrl: constants.baseUrl,
        url: constants.endpoint.chainsUrl,
        headers: { 
            'Content-Type': constants.content_types.applicationjson,
            'Authorization':  authDeets.access_code
        },
        qs: {
            symbol: ticker,
            apikey: authDeets.clientid,
            // strikeCount: 1,
            // contractType: 'CALL',
            // strike: '18',
            // toDate: '2020-07-30'
        }
    }

    request.get(options, function(error, response, body) {
        httpStatusCode = (response === undefined) ? 0 : response.statusCode;

        if (response.statusCode == 200) {
            // console.log(body);
            fse.outputFileSync(responseFile, body);

            let resp_file = fse.readFileSync(responseFile, 'utf8');
            // let something = JSON.parse(resp_file).symbol;
            let something = JSON.parse(resp_file).putExpDateMap;
            console.log(something);

        } else {
            fse.outputFileSync(responseFile, JSON.stringify(response));
            console.log(httpStatusCode);
            console.log(body);
        }

    });

});
