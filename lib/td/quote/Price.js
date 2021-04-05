const fse = require('fs-extra');
const request = require('request');
const Request = require('../../../lib/api/http/Request');
const Authorization = require('../auth/Authorization');
const LoadedAuth = require('../../../lib/td/auth/LoadedAuth');
const constants = require('../../../lib/td/constants.json');
const join = require('path').join;

class Price {
    
    static async priceHistory(ticker, periodType, period, frequencyType, frequency) {
        //also available options: startDate, endDate, extendedHours

        let result;

        await Authorization.refresh();
        
        let authDeets = new LoadedAuth();
    
        let options = {
            baseUrl: constants.baseUrl,
            url: join(constants.endpoint.marketdata, '/', ticker, constants.endpoint.pricehistory),
            headers: { 
                'Content-Type': constants.content_types.applicationjson,
                'Authorization':  authDeets.access_code
            },
            qs: {
                apikey: authDeets.clientid,
                periodType: periodType, //day, month, year, or ytd (year to date). Default is day.
                period: period,
                frequencyType: frequencyType, //day, month, year, or ytd (year to date). Default is day.
                frequency: frequency
            }
            //Example: For a 2 day / 1 min chart, the values would be:
            //period: 2
            //periodType: day
            //frequency: 1
            //frequencyType: min
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

module.exports = Price;