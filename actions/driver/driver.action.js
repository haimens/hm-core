const func = require('od-utility');
const VNAction = require('../action.model');
const VNDriver = require('../../models/driver/driver.class');
const VNRealm = require('../../models/realm/realm.class');

const VNDriverLocation = require('../../models/driver/driver.location');
const redis = require('od-utility-redis');

class VNDriverAction extends VNAction {


    static async registerDriver(params, body, query) {
        try {
            const {realm_token} = params;
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');
            const realmObj = new VNRealm(realm_token);

            const {vn_realm_id: realm_id} = await realmObj.findInstanceDetailWithToken();

            const driverObj = new VNDriver();

            const {driver_token} = await driverObj.registerDriver(body, realm_id);

            return {driver_token};
        } catch (e) {
            throw e;
        }
    }

    static async checkDriverWithKey(params, body, query) {
        const {driver_key} = params;
        if (!driver_key) func.throwErrorWithMissingParam('driver_key');

        try {
            const driver_detail = await redis.getAsync('DRIVER-CHECK', driver_key);
            if (driver_detail) return driver_detail;

            const {driver_token} = await VNDriver.findDriverTokenWithKey(driver_key);
            if (!driver_token) func.throwError('This user is not registered in this system');

            const driverObj = new VNDriver(driver_token);
            const {driver_status, realm_id, vn_driver_id, ...driver_info} = await driverObj.findInstanceDetailWithToken([
                'name', 'cell', 'email', 'username', 'cdate', 'udate',
                'driver_key', 'status AS driver_status', 'driver_token', 'realm_id', 'img_path'
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

    static async findDriverLocation(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNDriverLocation.findDriverLocationWithDriver(driver_id, driver_realm_id);


        } catch (e) {
            throw e;
        }
    }

    static async registerDriverLocation(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            const driverLocationObj = new VNDriverLocation();

            return await driverLocationObj.registerDriverLocation(body, realm_id, driver_id);

        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNDriverAction;