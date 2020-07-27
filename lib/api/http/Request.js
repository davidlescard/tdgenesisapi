const request = require('request');

class Request {

    static async post (options) {
        // console.log(JSON.stringify(options));

        return new Promise(function(resolve, reject) {
            request(options, function(error, response, body) {
                console.log(response.statusCode);
                if (error) {
                    reject(error);
                } else {
                    if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    if (response.statusCode === 204) {
                        resolve({
                            response: response
                        });
                    } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({
                            response: response,
                            body: body
                        });
                    } else {
                        reject({
                            response: response,
                            body: body
                        });
                    }
                }
            });
        });
    }

}

module.exports = Request;