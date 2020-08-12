const fse = require('fs-extra');
const request = require('request');
const Request = require('../../api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../auth/LoadedAuth');
const constants = require('../constants.json');
const join = require('path').join;

class Orders {
    
    static async getAccount(qfields = 'positions') {
        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join(constants.endpoint.accounts, authDeets.accountid),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                fields: qfields
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

module.exports = Orders;