/*jshint -W069 */
/* eslint-disable no-empty */
 
let request = require('request');
/**
*
* @class V2APIStub
* @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
* @param {string} [domainOrOptions.domain] - The project domain
* @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties add
*/
class V2APIStub  {
 
    constructor(options) {
        let domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : 'https://test-api.intralinks.com/v2';
        if (this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
        this.token = (typeof options === 'object') ? (options.token ? options.token : {}) : {};
    }
 
    /**
     * HTTP Request
     * @method
     * @name V2APIStub#request
     * @param {string} method - http method
     * @param {string} url - url to do request
     * @param {object} parameters
     * @param {object} body - body parameters / object
     * @param {object} headers - header parameters
     * @param {object} queryParameters - querystring parameters
     * @param {object} form - form data object
     * @param {object} deferred - promise object
     */
    request(method, url, parameters, body, headers, queryParameters, form) {
        let req = {
            method: method,
            uri: url,
            qs: queryParameters,
            headers: headers,
            body: body
        };
        if (Object.keys(form).length > 0) {
            req.form = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        return new Promise(function(resolve, reject) {
            request(req, function(error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {}
 
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
 
    /**
     * Set Token
     * @method
     * @name V2APIStub#setToken
     * @param {string} value - token's value
     * @param {string} headerOrQueryName - the header or query name to send the token at
     * @param {boolean} isQuery - true if send the token as query param, otherwise, send as header param
     */
    setToken(value, headerOrQueryName, isQuery) {
        this.token.value = value;
        this.token.headerOrQueryName = headerOrQueryName;
        this.token.isQuery = isQuery;
    }
    /**
     * Set Auth headers
     * @method
     * @name V2APIStub#setAuthHeaders
     * @param {object} headerParams - headers object
     */
    setAuthHeaders(headerParams) {
        let headers = headerParams ? headerParams : {};
        if (!this.token.isQuery) {
            if (this.token.headerOrQueryName) {
                headers[this.token.headerOrQueryName] = this.token.value;
            } else if (this.token.value) {
                headers['Authorization'] = 'Bearer ' + this.token.value;
            }
        }
        return headers;
    }
 
}
 
module.exports = V2APIStub;
