const ODCondition = require('../condition.model');
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

    static async findCarListInRealm(search_query = {}, realm_id) {

        try {

            if (!realm_id) func.throwErrorWithMissingParam('realm_id');
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_car',
                    ['plate_num', 'description', 'identifier', 'img_path', 'car_token', 'status'])
                .configComplexConditionQueryItem('vn_car', 'status', 1)
                .configComplexConditionQueryItem('vn_car', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_car')
                .configStatusCondition(status, 'vn_car')
                .configQueryLimit(start, 30);


            if (from_key || to_key) {
                conditions.configDateCondition({date_from, date_to, from_key, to_key}, 'vn_car');
            }

            if (keywords) {
                conditions.configKeywordCondition(
                    ['plate_num', 'description', 'identifier'], keywords, 'vn_car'
                );
            }

            const count = await this.findCountOfInstance('vn_car', conditions);
            if (count === 0) return {record_list: [], count, end: 0};
            const record_list = await this.findInstanceListWithComplexCondition('vn_car', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length}

        } catch (e) {
            throw e;
        }
    }

}


module.exports = VNCar;