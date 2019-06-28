const func = require('od-utility');
const VNTributeRate = require('../../models/tribute/rate.class');
const VNAction = require('../action.model');


class VNTributeAction extends VNAction {

    static async registerTributeRate(params, body = {}, query) {
        try {
            const {rate} = body;
            if (!rate) func.throwErrorWithMissingParam('rate');
            const tributeRateObj = new VNTributeRate();
            const {tribute_rate_token} = await tributeRateObj.registerTributeRate(rate);
            return {tribute_rate_token};
        } catch (e) {
            throw e;
        }
    }

    static async findTributeRateList(params, body, query) {
        try {
            return await VNTributeRate.findAllTributeRate();
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNTributeAction;