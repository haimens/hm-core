const ODInstance = require('../instance.model');
const func = require('od-utility');


class VNTribute extends ODInstance {

    constructor(tribute_token, tribute_id) {
        super('vn_tribute', 'tribute_token', tribute_token, tribute_id);
    }


    static async findTributeListWithRealm(search_query = {}, realm_id) {
        try {
            
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNTribute;