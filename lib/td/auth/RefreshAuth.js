const fse = require('fs-extra');
const join = require('path').join;
const Request = require('../../api/http/Request');
const constants = require('../constants.json');
const LoadedAuth = require('./LoadedAuth');

class RefreshAuth {
    
    static async evaluateAndDo() {

        let authDeets = new LoadedAuth();
        // let refreshFile = authDeets.refreshFile; 
        // let clientid = authDeets.clientid;
        // let token_JSON = authDeets.token_JSON;
        // let refresh_code = authDeets.refresh_code;
        
        /* refresh token if greater than 30 min */
        let elapsed = Date.now() - authDeets.token_JSON.timestamp;
        if (elapsed / 1000 > 29 * 60 ) {
            
            let form = {
                'grant_type': constants.grant_types.refresh_token,
                'refresh_token': authDeets.refresh_code,
                'access_type': constants.access_types.offline,
                'client_id': `${authDeets.clientid}@AMER.OAUTHAP`
            };
            let options = {
                baseUrl: constants.baseUrl,
                url: constants.endpoint.tokenUrl,
                method: 'POST',
                headers: { 'Content-Type': constants.content_types["x-www-form"] },
                form: form
            }

            console.log('fetching new access token');
            let result;
            try {
                result = await Request.post(options);
                let authJson = result.body;
                authJson.timestamp = Date.now();
                fse.outputFileSync(authDeets.refreshFile, JSON.stringify(authJson));
                console.log('refreshed token');
            } catch (e) {
                console.log(e);
            }
        }

        

    }


    

}

module.exports = RefreshAuth;