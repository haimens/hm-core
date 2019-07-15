const func = require('od-utility');
const VNAction = require('../action.model');
const VNDriver = require('../../models/driver/driver.class');
const VNRealm = require('../../models/realm/realm.class');

const VNDriverLocation = require('../../models/driver/driver.location');
const VNDriverCar = require('../../models/driver/driver.car');

const VNCar = require('../../models/car/car.class');
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
                'driver_key', 'status AS driver_status', 'driver_token', 'realm_id', 'img_path', 'rate'
            ]);

            if (driver_status !== 2) return {isValid: false, message: 'DRIVER SUSPENDED'};


            const realmObj = new VNRealm(null, realm_id);

            const {realm_token, icon_path, logo_path, realm_status, company_name} =
                await realmObj.findInstanceDetailWithId(
                    ['realm_token', 'icon_path', 'logo_path', 'company_name', 'status AS realm_status']
                );

            if (realm_status !== 2) return {isValid: false, message: 'REALM SUSPENDED'};

            const response = {isValid: true, ...driver_info, realm_token, icon_path, logo_path, company_name};

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

            const {driver_location_token} = await driverLocationObj.registerDriverLocation(body, realm_id, driver_id);
            return {driver_location_token};

        } catch (e) {
            throw e;
        }
    }

    static async findDriverDetail(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id, ...basic_info} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id',
                    'name', 'cell', 'email', 'identifier', 'img_path', 'license_num', 'username', 'status', 'rate']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            const location_info = await VNDriverLocation.findDriverLocationWithDriver(driver_id, realm_id);


            return {basic_info, location_info};

        } catch (e) {
            throw e;
        }
    }

    static async findDriverListInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNDriver.findDriverListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifyDriverDetail(params, body, query) {
        try {
            const {realm_token, driver_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const driverObj = new VNDriver(driver_token);
            const {realm_id: driver_realm_id, driver_key} =
                await driverObj.findInstanceDetailWithToken(['realm_id', 'driver_key']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');


            await driverObj.modifyInstanceDetailWithId(body,
                ['name', 'cell', 'email', 'identifier', 'license_num', 'img_path', 'status']
            );

            await redis.setAsync('DRIVER-CHECK', driver_key, null); //FUCK UP REDIS RECORD
            return {driver_token};
        } catch (e) {
            throw e;
        }
    }


    static async findDriverLocationListInRealm(params, body, query) {
        try {
            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNDriver.findDriverLocationListInRealm(query, realm_id);

        } catch (e) {
            throw e;
        }
    }


    static async registerDriverCar(params, body, query) {
        try {


            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            const {car_token} = body;

            const carObj = new VNCar(car_token);

            const {vn_car_id: car_id, realm_id: car_realm_id} =
                await carObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== car_realm_id) func.throwErrorWithMissingParam('REALM_ID NOT MATCH');


            const driverCarObj = new VNDriverCar();

            const {driver_car_token} = await driverCarObj.registerDriverCar(realm_id, car_id, driver_id);

            return {driver_car_token};

        } catch (e) {
            throw e;
        }
    }

    static async findDriverCarListWithDriver(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNDriverCar.findDriverCarRecordWithDriver(query, realm_id, driver_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifyDriverCar(params, body, query) {
        try {
            const {realm_token, driver_car_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const driverCarObj = new VNDriverCar(driver_car_token);
            const {realm_id: driver_realm_id} =
                await driverCarObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            await driverCarObj.modifyInstanceDetailWithId(body, ['status']);
            return {driver_car_token};
        } catch (e) {
            throw e;
        }
    }

    static async findDriverPayableList(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            return await VNDriver.findDriverPayableListInRealm(query, realm_id);

        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNDriverAction;