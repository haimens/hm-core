const func = require('od-utility');
const VNAction = require('../action.model');
const VNCarType = require('../../models/car/car.type');
const VNCar = require('../../models/car/car.class');

const VNDriver = require('../../models/driver/driver.class');

const VNDriverCar = require('../../models/driver/driver.car');

class VNCarAction extends VNAction {


    static async registerCar(params, body, query) {

        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const carObj = new VNCar();

            const {car_token} = await carObj.registerCar(body, realm_id);

            return {car_token};
        } catch (e) {
            throw e;
        }

    }

    static async modifyCarDetail(params, body, query) {
        try {
            const {realm_token, car_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const carObj = new VNCar(car_token);

            const {realm_id: car_realm_id} = await carObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== car_realm_id) func.throwError('REALM_ID NOT MATCH');

            await carObj.modifyInstanceDetailWithId(body, ['plate_num', 'description', 'identifier', 'img_path', 'status']);

            return {car_token};
        } catch (e) {
            throw e;
        }
    }

    static async findCarDetail(params, body, query) {
        try {
            const {realm_token, car_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const carObj = new VNCar(car_token);
            const {realm_id: car_realm_id} = await carObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== car_realm_id) func.throwError('REALM_ID NOT MATCH');

            const basic_info = await carObj.findInstanceDetailWithId(
                ['plate_num', 'description', 'identifier', 'img_path', 'status', 'car_token']
            );

            return {basic_info};
        } catch (e) {
            throw e;
        }
    }

    static async findCarListInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNCar.findCarListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }


    static async registerCarType(params, body, query) {
        try {
            const {realm_token} = params;


            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const carTypeObj = new VNCarType();

            const {car_type_token} = await carTypeObj.registerCarType(body, realm_id);

            return {car_type_token};
        } catch (e) {
            throw e;
        }
    }


    static async registerDriverCar(params, body, query) {
        try {

            const {realm_token, car_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_car_id: car_id, realm_id: car_realm_id} =
                await new VNCar(car_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== car_realm_id) func.throwError('REALM_ID NOT MATCH');

            const {driver_token} = body;

            const driverObj = new VNDriver(driver_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await driverObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== driver_realm_id) func.throwErrorWithMissingParam('REALM_ID NOT MATCH');

            const driverCarObj = new VNDriverCar();

            const {driver_car_token} = await driverCarObj.registerDriverCar(realm_id, car_id, driver_id);

            return {driver_car_token};

        } catch (e) {
            throw e;
        }
    }

    static async findDriverCarListWithDriver(params, body, query) {
        try {
            const {realm_token, car_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_car_id: car_id, realm_id: car_realm_id} =
                await new VNCar(car_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== car_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNDriverCar.findDriverCarRecordWithCar(query, realm_id, car_id);
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

}

module.exports = VNCarAction;