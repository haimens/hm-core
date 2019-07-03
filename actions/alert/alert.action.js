const VNAction = require('../action.model');
const VNAlert = require('../../models/alert/alert.class');

const func = require('od-utility');


class VNAlertAction extends VNAction {

    static async findAlertListInRealm(params, body, query) {

        try {
            const {realm_token} = params;
            const {realm_id} = await this.findAlertListInRealm(realm_token);

            return await VNAlert.findAlertListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNAlertAction;