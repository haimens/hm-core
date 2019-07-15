const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');

class VNWage extends ODInstance {

    constructor(wage_token, wage_id) {
        super('vn_wage', 'wage_token', wage_token, wage_id);
    }


    async registerWage(info = {}, realm_id, driver_id, coin_id, order_id) {
        const {note, type} = info;


        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!type) func.throwErrorWithMissingParam('type');
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');
        if (!coin_id) func.throwErrorWithMissingParam('coin_id');
        try {

            this.instance_id = await this.insertInstance(
                {
                    note: note || '', type, realm_id, driver_id, coin_id,
                    cdate: 'now()', udate: 'now()', status: 0
                }
            );

            this.instance_token = `WAG-${func.encodeUnify(this.instance_id, 'wag')}`;

            await this.updateInstance({wage_token: this.instance_token, status: 1});

            return {wage_token: this.instance_token, wage_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findWageListInRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_wage',
                    ['wage_token', 'cdate', 'udate', 'note', 'type', 'status']
                )
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionKeys('vn_driver', ['driver_token', 'name', 'img_path', 'cell', 'email'])
                .configComplexConditionJoins(
                    'vn_wage',
                    [
                        {key: 'coin_id', tar: 'vn_coin'},
                        {key: 'order_id', tar: 'vn_order'},
                        {key: 'driver_id', tar: 'vn_driver'}
                    ]
                )
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_wage')
                .configKeywordCondition(['note', 'type'], keywords, 'vn_wage')
                .configComplexConditionQueryItem('vn_wage', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_wage')
                .configStatusCondition(status, 'vn_wage')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_wage', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_wage', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findWageListWithDriver(search_query = {}, realm_id, driver_id) {
        try {

            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_wage',
                    ['wage_token', 'cdate', 'udate', 'note', 'type', 'status']
                )
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionJoins(
                    'vn_wage',
                    [
                        {key: 'coin_id', tar: 'vn_coin'},
                        {key: 'order_id', tar: 'vn_order'},
                        {key: 'driver_id', tar: 'vn_driver'}
                    ]
                )
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_wage')
                .configKeywordCondition(['note', 'type'], keywords, 'vn_wage')
                .configComplexConditionQueryItem('vn_wage', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_wage', 'driver_id', driver_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_wage')
                .configStatusCondition(status, 'vn_wage')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_wage', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_wage', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findWageSumWithDriver(search_query = {}, realm_id, driver_id) {
        try {

            const {date_from, date_to, from_key, to_key, type} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('SUM(vn_coin.amount) AS sum')
                .configComplexConditionJoin('vn_wage', 'coin_id', 'vn_coin')
                .configComplexConditionQueryItem('vn_wage', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_wage', 'driver_id', driver_id)
                .configComplexConditionQueryItem('vn_wage', 'type', type || 1)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_wage')
                .configStatusCondition(1, 'vn_wage');

            const [{sum}] = await this.findInstanceListWithComplexCondition('vn_wage', conditions);


            return {sum: (parseInt(sum) || 0), type: (type || 1)};

        } catch (e) {
            throw e;
        }
    }


    static async findWageSumInRealm(search_query = {}, realm_id) {
        try {

            const {date_from, date_to, from_key, to_key, type} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('SUM(vn_coin.amount) AS sum')
                .configComplexConditionJoin('vn_wage', 'coin_id', 'vn_coin')
                .configComplexConditionQueryItem('vn_wage', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_wage', 'type', type || 1)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_wage')
                .configStatusCondition(1, 'vn_wage');

            const [{sum}] = await this.findInstanceListWithComplexCondition('vn_wage', conditions);


            return {sum: (parseInt(sum) || 0), type: (type || 1)};

        } catch (e) {
            throw e;
        }
    }

    static async cancelWageInOrder(order_id, realm_id) {
        try {

            const query = `
                UPDATE vn_wage SET vn_wage.status = 0, vn_wage.udate = 'now()'  
                WHERE vn_wage.order_id = ${order_id} 
                AND vn_wage.realm_id = ${realm_id}
            `;

            const response = await this.performQuery(query);

            return {response};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNWage;