const func = require('od-utility');
const VNRealm = require('../../models/realm/realm.class');
const VNAction = require('../action.model');
const VNTributeRate = require('../../models/tribute/rate.class');
const VNAddress = require('../../models/address/address.class');

const VNGoogleMap = require('../../models/address/google.class');


class VNRealmAction extends VNAction {

    static async registerRealm(params, body, query) {
        try {

            const {tribute_rate_token, realm_info, address_str} = body;

            const rateObj = new VNTributeRate(tribute_rate_token);

            const {vn_tribute_rate_id: tribute_rate_id} = await rateObj.findInstanceDetailWithToken();

            const addressObj = new VNAddress();

            const address_info = await VNGoogleMap.findFormattedAddress(address_str);

            console.log(address_info);

            const {address_id, address_token} = await addressObj.registerAddress(address_info);

            const realmObj = new VNRealm();

            const {realm_token} = await realmObj.registerRealm(realm_info, tribute_rate_id, address_id);

            return {address_token, realm_token};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNRealmAction;