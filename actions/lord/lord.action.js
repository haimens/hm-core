const func = require('od-utility');
const VNAction = require('../action.model');
const VNLord = require('../../models/lord/lord.class');
const VNRealm = require('../../models/realm/realm.class');
const redis = require('od-utility-redis');

class VNLordAction extends VNAction {
    static async checkLordWithKey(params, body, query) {
        const {lord_key} = params;
        if (!lord_key) func.throwErrorWithMissingParam('lord_key');

        try {
            const lord_detail = await redis.getAsync('KING-CHECK', lord_key);
            if (lord_detail) return lord_detail;

            const {lord_token} = await VNLord.findLordTokenWithKey(lord_key);
            if (!lord_token) func.throwError('This user is not registered in this system');

            const lordObj = new VNLord(lord_token);
            const {lord_status, realm_id, ...lord_info} = await lordObj.findInstanceDetailWithToken([
                'name', 'cell', 'email', 'username', 'cdate', 'udate',
                'lord_key', 'status AS lord_status', 'lord_token', 'realm_id'
            ]);

            if (lord_status !== 2) return {isValid: false, message: 'LORD SUSPENDED'};


            const realmObj = new VNRealm(null, realm_id);

            const {realm_token, icon_path, logo_path, realm_status} =
                await realmObj.findInstanceDetailWithId(
                    ['realm_token', 'icon_path', 'logo_path', 'status AS realm_status']
                );

            if (realm_status !== 2) return {isValid: false, message: 'REALM SUSPENDED'};

            const response = {isValid: true, ...lord_info, realm_token, icon_path, logo_path};

            await redis.setAsync('KING-CHECK', lord_key, response);

            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNLordAction;