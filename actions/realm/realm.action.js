const func = require('od-utility');
const VNRealm = require('../../models/realm/realm.class');
const VNAction = require('../action.model');
const VNTributeRate = require('../../models/tribute/rate.class');
const VNAddress = require('../../models/address/address.class');

const VNGoogleMap = require('../../models/address/google.class');

const VNSetting = require('../../models/setting/setting.class');

const VNCarType = require('../../models/car/car.type');


const sedan = {
    name: 'SEDAN', price_prefix: '0',
    img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a1e60dc78feea85181d7b56979a766e4.jpeg',
    max_capacity: 4
};
const minivan = {
    name: 'MINIVAN', price_prefix: '1000',
    img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a3fcff7ad2625723da1c84bf35ef101b.jpeg',
    max_capacity: 6
};

class VNRealmAction extends VNAction {

    static async registerRealm(params, body, query) {
        try {

            const {tribute_rate_token, realm_info, address_str} = body;

            const rateObj = new VNTributeRate(tribute_rate_token);

            const {vn_tribute_rate_id: tribute_rate_id} = await rateObj.findInstanceDetailWithToken();

            const addressObj = new VNAddress();

            const address_info = await VNGoogleMap.findFormattedAddress(address_str);

            if (!address_info) func.throwError('ADDRESS CANNOT BE FOUND', 400);

            const {address_id, address_token} = await addressObj.registerAddress(address_info);

            const realmObj = new VNRealm();

            const {realm_token, realm_id} = await realmObj.registerRealm(realm_info, tribute_rate_id, address_id);


            await Promise.all(
                [
                    new VNSetting().registerSetting('price_base', 3000, realm_id),
                    new VNSetting().registerSetting('price_minute', 35, realm_id),
                    new VNSetting().registerSetting('price_mile', 175, realm_id),
                    new VNCarType().registerCarType(sedan, realm_id),
                    new VNCarType().registerCarType(minivan, realm_id)
                ]
            );


            return {address_token, realm_token};
        } catch (e) {
            throw e;
        }
    }

    static async findRealmList(params, body, query) {
        try {
            return await VNRealm.findRealmListInSystem(query);
        } catch (e) {
            throw e;
        }
    }

    static async modifyBasicRealmDetail(params, body, query) {
        try {
            const {realm_token} = params;

            const realmObj = new VNRealm(realm_token);

            const response = await realmObj.modifyInstanceDetailWithToken(
                body,
                ['company_name', 'company_title', 'status', 'logo_path', 'icon_path', 'status']
            );
            return {response};
        } catch (e) {
            throw e;
        }
    }

    static async modifyResourceInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const realmObj = new VNRealm(realm_token);

        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNRealmAction;