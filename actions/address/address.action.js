const func = require('od-utility');

const VNAddress = require('../../models/address/address.class');

const VNGoogleMap = require('../../models/address/google.class');

const VNAction = require('../action.model');


class VNAddressAction extends VNAction {

    static async registerAddress(params, body, query) {

        try {

            const {address_str} = body;
            if (!address_str) func.throwErrorWithMissingParam('address_str');

            const address_info = await VNGoogleMap.findFormattedAddress(address_str);
            const {address_token} = await new VNAddress().registerAddress(address_info);

            return {address_token};
        } catch (e) {
            throw e;
        }
    }

}


module.exports = VNAddressAction;