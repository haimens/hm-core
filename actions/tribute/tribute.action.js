const func = require('od-utility');
const VNTributeRate = require('../../models/tribute/rate.class');

const VNTribute = require('../../models/tribute/tribute.class');
const VNCoin = require('../../models/coin/coin.class');
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


    static async modifyTributeRate(params, body, query) {
        try {
            const {tribute_rate_token} = params;

            const tributeRateObj = new VNTributeRate(tribute_rate_token);

            await tributeRateObj.modifyInstanceDetailWithToken(
                body, ['status']
            );

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

    static async findTributeListInRealm(params, body, query) {
        try {

            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNTribute.findTributeListWithRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async registerTributeDetail(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {note, coin_token} = body;

            const {vn_coin_id: coin_id} =  await new VNCoin(coin_token).findInstanceDetailWithToken();

            const {tribute_token} = await new VNTribute().registerTributeDetail({note}, realm_id, coin_id);

            return {tribute_token};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNTributeAction;