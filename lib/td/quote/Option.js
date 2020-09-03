const fse = require('fs-extra');
const request = require('request');
const Request = require('../../api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../auth/LoadedAuth');
const constants = require('../constants.json');
const join = require('path').join;

class Option {
    
    static async getOptionChain(ticker, queryParams) {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
        let responseFile = join('..', constants.auth.responseFile);
    
        let options = {
            baseUrl: constants.baseUrl,
            url: constants.endpoint.chainsUrl,
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                apikey: authDeets.clientid,
                symbol: ticker,
                strikeCount: queryParams.strikeCount ? queryParams.strikeCount : undefined,
                contractType: queryParams.contractType ? queryParams.contractType : undefined,
                strike: queryParams.strike ? queryParams.strike : undefined,
                toDate: queryParams.toDate ? queryParams.toDate : undefined,
                // strikeCount: 1,
                // contractType: 'CALL',
                // strike: '18',
                // toDate: '2020-07-30'
            }
        }
    
        try {
            result = await Request.get(options); 
            // console.log(result.body);
    
            // let httpStatusCode = (result.response === undefined) ? 0 : result.response.statusCode;
            // if (httpStatusCode == 200) {
            //     fse.outputFileSync(responseFile, JSON.stringify(result.body));
            //     let resp_file = fse.readFileSync(responseFile, 'utf8');
            //     let something = JSON.parse(resp_file).putExpDateMap;
            //     console.log(something);
            // } else {
            //     fse.outputFileSync(responseFile, JSON.stringify(result.response));
            //     console.log(httpStatusCode);
            //     console.log(body);
            // }
        } catch (e) {
            console.log(e);
            result = null;
        }
        
        return result;

    }
}

module.exports = Option;