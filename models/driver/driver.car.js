const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNDriverCar extends ODInstance {

    constructor(driver_car_token, driver_car_id) {
        super('vn_driver_car', 'driver_car_token', driver_car_token, driver_car_id);
    }

    async registerDriverCar(realm_id, car_id, driver_id) {
        try {
            if (!realm_id) func.throwErrorWithMissingParam('realm_id');
            if (!car_id) func.throwErrorWithMissingParam('car_id');
            if (!driver_id) func.throwErrorWithMissingParam('driver_id');


            const count = await VNDriverCar._checkCarDriverExist(driver_id, car_id, realm_id);

            if (count !== 0) func.throwError('RECORD ALREADY ADDED');

            this.instance_id = await this.insertInstance(
                {realm_id, driver_id, car_id, cdate: 'now()', udate: 'now()', status: 0}
            );

            this.instance_token = `DCR-${func.encodeUnify(this.instance_id, 'dcr')}`;

            await this.updateInstance({driver_car_token: this.instance_token, status: 1});

            return {driver_car_token: this.instance_token, driver_car_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findDriverCarRecordWithDriver(search_query = {}, realm_id, driver_id) {
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_driver_car', ['driver_car_token', 'cdate', 'udate'])
                .configComplexConditionKeys('vn_car', ['plate_num', 'description', 'identifier', 'img_path', 'car_token'])
                .configComplexConditionJoin('vn_driver_car', 'car_id', 'vn_car')
                .configStatusCondition(status, 'vn_driver_car')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_driver_car')
                .configComplexConditionQueryItem('vn_driver_car', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_driver_car', 'driver_id', driver_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_driver_car')
                .configKeywordCondition(['plate_num', 'description', 'identifier'], keywords, 'vn_car')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_driver_car', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_driver_car', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }


    static async findDriverCarRecordWithCar(search_query = {}, realm_id, car_id) {
        if (!car_id) func.throwErrorWithMissingParam('driver_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_driver_car', ['driver_car_token', 'cdate', 'udate'])
                .configComplexConditionKeys('vn_car', ['plate_num', 'description', 'identifier', 'img_path AS car_img_path', 'car_token'])
                .configComplexConditionKeys('vn_driver',
                    ['name', 'cell', 'email', 'username', 'img_path AS driver_img_path', 'driver_token']
                )
                .configComplexConditionJoin('vn_driver_car', 'car_id', 'vn_car')
                .configComplexConditionJoin('vn_driver_car', 'driver_id', 'vn_driver')
                .configStatusCondition(status, 'vn_driver_car')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_driver_car')
                .configComplexConditionQueryItem('vn_driver_car', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_driver_car', 'car_id', car_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_driver_car')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_driver')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_driver_car', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_driver_car', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }


    static async _checkCarDriverExist(driver_id, car_id, realm_id) {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey(
                    'COUNT(vn_driver_car.id) AS count '
                )
                .configComplexConditionQueryItem(
                    'vn_driver_car', 'driver_id', driver_id
                )
                .configComplexConditionQueryItem('vn_driver_car', 'car_id', car_id)
                .configComplexConditionQueryItem('vn_driver_car', 'realm_id', realm_id)
                .configStatusCondition(1, 'vn_driver_car')
                .configQueryLimit(0, 1);


            const [{count}] = await this.findInstanceListWithComplexCondition('vn_driver_car', conditions);

            return parseInt(count) || 0;

        } catch (e) {

            throw e;
        }
    }

}

module.exports = VNDriverCar;