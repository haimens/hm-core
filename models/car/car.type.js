const ODCondition = require('../condition.model');
const ODInstance = require('../instance.model');
const func = require('od-utility');


class VNCarType extends ODInstance {

    constructor(car_type_token, car_type_id) {
        super('vn_car_type', 'car_type_token', car_type_token, car_type_id);
    }

    async registerCarType(info = {}, realm_id) {
        const {name, price_prefix, img_path, max_capacity} = info;
        if (!name) func.throwErrorWithMissingParam('name');

        if (!price_prefix) func.throwErrorWithMissingParam('price_prefix');
        if (!img_path) func.throwErrorWithMissingParam('img_path');

        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!max_capacity) func.throwErrorWithMissingParam('max_capacity');

        try {
            const count = await VNCarType._findCarTypeCountInRealm(realm_id);

            if (count >= 30) func.throwErrorWithMissingParam('CAN ONLY HAVE 30 CAR TPYES');

            this.instance_id = await this.insertInstance(
                {
                    name, price_prefix, max_capacity,
                    img_path, realm_id, cdate: 'now()', udate: 'now()',
                    status: 0
                }
            );

            this.instance_token = `CTY-${func.encodeUnify(this.instance_id, 'cty')}`;

            await this.updateInstance({car_type_token: this.instance_token, status: 1});

            return {car_type_token: this.instance_token, car_type_id: this.instance_id};

        } catch (e) {
            throw e;
        }
    }

    static async _findCarTypeCountInRealm(realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const query = `
                SELECT COUNT(id) AS count 
                FROM vn_car_type 
                WHERE realm_id = ${realm_id} 
                AND status = 1
            `;

            const [{count}] = await this.performQuery(query);

            return count || 0;
        } catch (e) {
            throw e;
        }

    }

    static async findAllCarTypeInRealm(realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_car_type',
                    [
                        'name', 'price_prefix',
                        'id AS car_type_id', 'img_path', 'max_capacity'
                    ]
                )
                .configComplexConditionQueryItem('vn_car_type', 'realm_id', realm_id)
                .configStatusCondition(1, 'vn_car_type')
                .configQueryLimit(0, 30);


            const record_list = await this.findInstanceListWithComplexCondition('vn_car_type', conditions);

            return {record_list};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNCarType;