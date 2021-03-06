const func = require('od-utility');
const VNRealm = require('../models/realm/realm.class');

class VNAction {

    static async findRealmIdWithToken(realm_token) {
        try {
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');

            const realmObj = new VNRealm(realm_token);

            const {vn_realm_id: realm_id, company_name, company_title, status} = await realmObj.findInstanceDetailWithToken(
                ['company_name', 'company_title', 'status']);

            return {realm_token, realm_id, company_name, company_title, realmObj, status};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNAction;