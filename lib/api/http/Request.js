const request = require('request');
const syncRequest = require('sync-request');
const join = require('path').join;

class Request {

//     static async post (options) {
//         // console.log(JSON.stringify(options));

//         return new Promise(function(resolve, reject) {
//             request.post(options, function(error, response, body) {
//                 console.log(response.statusCode);
//                 if (error) {
//                     reject(error);
//                 } else {
//                     try {
//                         body = JSON.parse(body);
//                     } catch (e) {
//                         console.log(e);
//                     }
//                     if (response.statusCode === 204) {
//                         resolve({
//                             response: response
//                         });
//                     } else if (response.statusCode >= 200 && response.statusCode <= 299) {
//                         resolve({
//                             response: response,
//                             body: body
//                         });
//                     } else {
//                         reject({
//                             response: response,
//                             body: body
//                         });
//                     }
//                 }
//             });
//         });
//     }
    
    static async post (options) {
        console.log(JSON.stringify(options));
        options.method = 'POST';
        return await Request.handleRequest(options);
    }
    
    static async get (options) {
        // console.log(JSON.stringify(options));
        options.method = 'GET';
        return await Request.handleRequest(options);
    }
    
    static async delete (options) {
        // console.log(JSON.stringify(options));
        options.method = 'DELETE';
        return await Request.handleRequest(options);
    }
    
    static async put (options) {
        // console.log(JSON.stringify(options));
        options.method = 'PUT';
        return await Request.handleRequest(options);
    }

    static async handleRequest(options) {
        return new Promise(function(resolve, reject) {
            request(options, function(error, response, body) {
                console.log(response.statusCode);
                // console.log(response.toJSON());
                if (error) {
                    reject(error);
                } else {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        console.log(`could not parse body ${body}`);
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

    static getSync (options) {
        // console.log(JSON.stringify(options));
        let method = 'GET';
        let url = Request.theUrl(options);
        options.baseUrl = undefined;
        options.url = undefined;
        let newopts = {headers: options.headers, qs: options.qs}
        return Request.handleSyncRequest(method, url, newopts);
    }
    
    static handleSyncRequest(method, url, options) {
        // console.log(method);
        // console.log(url);
        // console.log(options);
        let res = syncRequest(method, url, options);

        return res; //res.statusCode, res.headers, res.body, res.getBody(encoding?)
    }

    static theUrl(optionsWithUrl) {
        return join(optionsWithUrl.baseUrl, optionsWithUrl.url);
    }

}

module.exports = Request;