const fse = require('fs-extra');
const request = require('request');
const Request = require('../../api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../auth/LoadedAuth');
const constants = require('../constants.json');
const join = require('path').join;

class SavedOrders {
    
    static async getSavedOrders() {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join(constants.endpoint.accounts, authDeets.accountid, constants.endpoint.savedorders),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
        }
    
        try {
            result = await Request.get(options); 
        } catch (e) {
            console.log(e);
            result = null;
        }
        return result;
    }
    
    static async createSavedOrder() {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join(constants.endpoint.accounts, authDeets.accountid, constants.endpoint.savedorders),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            body: JSON.stringify({
                "complexOrderStrategyType": "NONE",
                "orderType": "LIMIT",
                "session": "NORMAL",
                "price": "0.45",
                "duration": "DAY",
                "orderStrategyType": "SINGLE",
                "orderLegCollection": [
                  {
                    "instruction": "BUY_TO_OPEN",
                    "quantity": 1,
                    "instrument": {
                      "symbol": "JBLU_082120C12",
                      "assetType": "OPTION"
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

module.exports = SavedOrders;