const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');

class VNWage extends ODInstance {

    constructor(wage_token, wage_id) {
        super('vn_wage', 'wage_token', wage_token, wage_id);
    }


    async registerWage(info = {}, realm_id, driver_id) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async findWageListInRealm(search_query = {}, realm_id) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async findWageListWithDriver(search_query = {}, realm_id) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async findWageSumWithDriver(search_query = {}, realm_id, driver_id) {
        try {
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNWage;