const fse = require('fs-extra');
const request = require('request');
const Request = require('./lib/api/http/Request');
const RefreshAuth = require('./lib/td/auth/RefreshAuth');
const LoadedAuth = require('./lib/td/auth/LoadedAuth');
const constants = require('./lib/td/constants.json');

RefreshAuth.evaluateAndDo().then(async () => {

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

    /**
     * 
     * 
     * 
     * Implement Request module
     * 
     * 
     * 
     * 
     */

     
    //  async function doit (){
        // let result = await Request.get(options).then(() => {
        let result = await Request.get(options);
        // console.log(result);
        let httpStatusCode = (result.response === undefined) ? 0 : result.response.statusCode;
    
        if (result.response.statusCode == 200) {
            fse.outputFileSync(responseFile, result.body);
    
            let resp_file = fse.readFileSync(responseFile, 'utf8');
            console.log(resp_file)
            let something = JSON.parse(resp_file).putExpDateMap;
            console.log(something);
    
        } else {
            fse.outputFileSync(responseFile, JSON.stringify(response));
            console.log(httpStatusCode);
            console.log(body);
        }
    // , function(error, response, body) {

    // };

    doit();

});
