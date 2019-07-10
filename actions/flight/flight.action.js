const func = require('od-utility');

const VNAction = require('../action.model');


class VNFlightAction extends VNAction {
    static async searchFlight(params, body, query) {
        try {

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {}
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNFlightAction;