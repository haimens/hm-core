const VNAction = require('../action.model');
const func = require('od-utility');


const VNWage = require('../../models/wage/wage.class');
const VNCoin = require('../../models/coin/coin.class');

const VNDriver = require('../../models/driver/driver.class');

class VNWageAction extends VNAction {

    static async registerWage(params, body, query) {
        try {

            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {coin_token, ...other_info} = body;

            if (!coin_token) func.throwErrorWithMissingParam('coin_token');

            const {vn_coin_id: coin_id} = await new VNCoin(coin_token).findInstanceDetailWithToken();

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');
            const {wage_token} = await new VNWage().registerWage(other_info, realm_id, driver_id, coin_id);

            return {wage_token};
        } catch (e) {
            throw e;
        }

    }

    static async findWageListInRealm(params, body, query) {
        try {

            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNWage.findWageListInRealm(query, realm_id);

        } catch (e) {
            throw e;
        }

    }

    static async findWageListWithDriver(params, body, query) {

        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNWage.findWageListWithDriver(query, realm_id, driver_id);

        } catch (e) {
            throw e;
        }
    }

    static async findWageSumInRealm(params, body, query) {

        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNWage.findWageSumInRealm(query, realm_id);

        } catch (e) {
            throw e;
        }
    }

    static async findWageSumWithDriver(params, body, query) {

        try {

            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNWage.findWageSumWithDriver(query, realm_id, driver_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifyWageDetail(params, body, query) {
        try {
            const {realm_token, wage_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const wageObj = new VNWage(wage_token);

            const {realm_id: wage_realm_id} = await wageObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== wage_realm_id) func.throwError('REALM_ID NOT MATCH');

            await wageObj.modifyInstanceDetailWithId(body, ['note', 'status']);

            return {wage_token};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNWageAction;