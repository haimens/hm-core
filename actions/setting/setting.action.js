const func = require('od-utility');
const VNAction = require('../action.model');
const VNRealm = require('../../models/realm/realm.class');
const VNSetting = require('../../models/setting/setting.class');


class VNSettingAction extends VNAction {

    static async registerSetting(params, body, query) {
        try {
            const {realm_token} = params;
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {key, value} = body;

            const settingObj = new VNSetting();

            const {setting_token} = await settingObj.registerSetting(key, value, realm_id);


            return {setting_token};

        } catch (e) {
            throw e;
        }

    }

    static async findSettingListInRealm(params, body, query) {

        try {

            const {realm_token} = params;
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');
            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            return await VNSetting.findSettingListInRealm(realm_id, query);

        } catch (e) {
            throw e;
        }

    }


    static async findSettingWithKey(params, body, query) {
        try {


        } catch (e) {
            throw e;
        }

    }


    static async modifySetting(params, body, query) {
        try {
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNSettingAction;