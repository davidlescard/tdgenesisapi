const fse = require('fs-extra');
const join = require('path').join;
const Request = require('../../api/http/Request');
const constants = require('../constants.json');

class LoadedAuth {
    constructor() {
        this.pathToAut = '../';
        this.refreshFile = join(this.pathToAut, constants.auth.refreshFile);
        this.clientid = fse.readFileSync(join(this.pathToAut, constants.auth.clientid), 'utf8');
        this.token_file = fse.readFileSync(this.refreshFile, 'utf8');
        this.token_JSON = JSON.parse(this.token_file);
        this.refresh_code = this.token_JSON.refresh_token;
        this.access_code = 'Bearer ' + this.token_JSON.access_token;
    }

}

module.exports = LoadedAuth;