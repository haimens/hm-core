const ODInstance = require('../instance.model');
const func = require('od-utility');


class VNCar extends ODInstance {

    constructor(car_token, car_id) {
        super('vn_car', 'car_token', car_token, car_id);
    }

    async registerCar(car_info = {}, realm_id) {
        try {
            if (!realm_id) func.throwErrorWithMissingParam('realm_id');

            const {identifier, plate_num, description, img_path} = car_info;
            if (!identifier) func.throwErrorWithMissingParam('identifier');
            if (!plate_num) func.throwErrorWithMissingParam('plate_num');
            if (!description) func.throwErrorWithMissingParam('description');
            if (!img_path) func.throwErrorWithMissingParam('img_path');


            this.instance_id = await this.insertInstance({
                identifier, plate_num, description, img_path, cdate: 'now()', udate: 'now()',
                status: 0, realm_id
            });

            this.instance_token = `CAR-${func.encodeUnify(this.instance_id, 'car')}`;

            await this.updateInstance({car_token: this.instance_token, status: 1});

            return {car_id: this.instance_id, car_token: this.instance_token};

        } catch (e) {
            throw e;
        }
    }

    static async findCarListInRealm(realm_id, search_query = {}) {

        try {
        } catch (e) {
            throw e;
        }
    }


}


module.exports = VNCar;