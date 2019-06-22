const ODInstance = require('../instance.model');
const func = require('od-utility');


class VNTribute extends ODInstance {

    constructor(tribute_token, tribute_id) {
        super('vn_tribute', 'tribute_token', tribute_token, tribute_id);
    }

    async registerTribute(rate) {

    }

}

module.exports = VNTribute;