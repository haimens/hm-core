const func = require('od-utility');
const VNAction = require('../action.model');
const VNDriver = require('../../models/driver/driver.class');
const VNRealm = require('../../models/realm/realm.class');
const redis = require('od-utility-redis');

class VNDriverAction extends VNAction {
    static async checkDriverWithKey(params, body, query) {
        const {driver_key} = params;
        if (!driver_key) func.throwErrorWithMissingParam('driver_key');

        try {
            const driver_detail = await redis.getAsync('DRIVER-CHECK', driver_key);
            if (driver_detail) return driver_detail;

            const {driver_token} = await VNDriver.findDriverTokenWithKey(driver_key);
            if (!driver_token) func.throwError('This user is not registered in this system');

            const driverObj = new VNDriver(driver_token);
            const {driver_status, realm_id, ...driver_info} = await driverObj.findInstanceDetailWithToken([
                'name', 'cell', 'email', 'username', 'cdate', 'udate',
                'driver_key', 'status AS driver_status', 'driver_token', 'realm_id'
            ]);

            if (driver_status !== 2) return {isValid: false, message: 'DRIVER SUSPENDED'};


            const realmObj = new VNRealm(null, realm_id);

            const {realm_token, icon_path, logo_path, realm_status} =
                await realmObj.findInstanceDetailWithId(
                    ['realm_token', 'icon_path', 'logo_path', 'status AS realm_status']
                );

            if (realm_status !== 2) return {isValid: false, message: 'REALM SUSPENDED'};

            const response = {isValid: true, ...driver_info, realm_token, icon_path, logo_path};

            await redis.setAsync('DRIVER-CHECK', driver_key, response);

            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNDriverAction;