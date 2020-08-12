const fse = require('fs-extra');
const request = require('request');
const Request = require('../../../lib/api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../../../lib/td/auth/LoadedAuth');
const constants = require('../../../lib/td/constants.json');
const join = require('path').join;

class Quotes {
    
    static async getQuotes(ticker) { //accepts comma-separated list
    // static getQuotes(ticker) { //accepts comma-separated list
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: constants.endpoint.quotes,
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                apikey: authDeets.clientid,
                symbol: ticker
            }
        }
    
        try {
            result = await Request.get(options); 
            // result = Request.getSync(options); 
        } catch (e) {
            console.log(e);
            result = null;
        }
        
        return result;

    }
    
    static async getPriceHistory(ticker) { //accepts comma-separated list
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join('marketdata', ticker, 'pricehistory'),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                apikey: authDeets.clientid,
            }
        }
    
        try {
            result = await Request.get(options); 
        } catch (e) {
            console.log(e);
            result = null;
        }
        
        return result;

    }
}

module.exports = Quotes;