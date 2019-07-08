const func = require('od-utility');
const VNAction = require('../action.model');
const VNCarType = require('../../models/car/car.type');
const VNCar = require('../../models/car/car.class');

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

}

module.exports = VNCarAction;