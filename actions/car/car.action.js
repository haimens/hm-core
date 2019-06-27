const func = require('od-utility');
const VNAction = require('../action.model');
const VNCarType = require('../../models/car/car.type');

class VNCarAction extends VNAction {


    static async registerCar(params, body, query) {

    }


    static async registerCarType(params, body, query) {
        try {
            const {realm_token} = params;

            if (!realm_token) func.throwErrorWithMissingParam('realm_token');

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