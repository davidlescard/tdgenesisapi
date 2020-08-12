const fse = require('fs-extra');
const request = require('request');
const Request = require('../../api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../auth/LoadedAuth');
const constants = require('../constants.json');
const join = require('path').join;

class Orders {
    
    static async getOrders(maxResults, fromEnteredTime, toEnteredTime, status) {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: constants.endpoint.orders,
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                accountId: authDeets.accountid,
                maxResults: maxResults ? maxResults : undefined,
                fromEnteredTime: fromEnteredTime ? fromEnteredTime : undefined,
                toEnteredTime: toEnteredTime ? toEnteredTime : undefined,
                status: status ? status : undefined
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
    
    static async createOrder() {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join(constants.endpoint.accounts, authDeets.accountid, constants.endpoint.orders),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            body: JSON.stringify({
                "orderType": "MARKET",
                "session": "NORMAL",
                "duration": "DAY",
                "orderStrategyType": "SINGLE",
                "orderLegCollection": [
                  {
                    "instruction": "Buy",
                    "quantity": 1,
                    "instrument": {
                      "symbol": "CCL",
                      "assetType": "EQUITY"
                    }
                  }
                ]
              })
        }
    
        try {
            result = await Request.post(options); 
        } catch (e) {
            console.log(e);
            result = null;
        }
        return result;
    }
}

module.exports = Orders;