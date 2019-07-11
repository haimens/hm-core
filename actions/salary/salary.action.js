const VNAction = require('../action.model');
const func = require('od-utility');


const VNSalary = require('../../models/salary/salary.class');

const VNDriver = require('../../models/driver/driver.class');

const VNCoin = require('../../models/coin/coin.class');


class VNSalaryAction extends VNAction {

    static async registerSalary(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {coin_token, ...other_info} = body;

            if (!coin_token) func.throwErrorWithMissingParam('coin_token');

            const {vn_coin_id: coin_id} = await new VNCoin(coin_token).findInstanceDetailWithToken();

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            const {salary_token} = await new VNSalary().registerSalary(other_info, coin_id, realm_id, driver_id);

            return {salary_token};
        } catch (e) {
            throw e;
        }
    }

    static async findSalaryListInRealm(params, body, query) {

        try {

            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNSalary.findSalaryListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }

    }

    static async findSalaryListWithDriver(params, body, query) {
        try {

            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNSalary.findSalaryListWithDriver(query, realm_id, driver_id);
        } catch (e) {
            throw e;
        }
    }

    static async findSalarySumInRealm(params, body, query) {
        try {

            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNSalary.findSalarySumInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findSalarySumWithDriver(params, body, query) {
        try {

            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNSalary.findSalarySumWithDriver(query, realm_id, driver_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifySalaryDetail(params, body, query) {
        try {
            const {realm_token, salary_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const salaryObj = new VNWage(salary_token);

            const {realm_id: salary_realm_id} = await salaryObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== salary_realm_id) func.throwError('REALM_ID NOT MATCH');

            await salaryObj.modifyInstanceDetailWithId(body, ['status', 'receipt']);
            return {salary_token};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNSalaryAction;