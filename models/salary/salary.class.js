const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');

class VNSalary extends ODInstance {
    constructor(salary_token, salary_id) {
        super('vn_salary', 'salary_token', salary_token, salary_id);
    }

    async registerSalary(info = {}, coin_id, realm_id, driver_id) {
        const {receipt} = info;

        if (!coin_id) func.throwErrorWithMissingParam('coin_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');

        try {
            this.instance_id = await this.insertInstance(
                {
                    receipt: receipt || '', coin_id, realm_id, driver_id,
                    cdate: 'now()', udate: 'now()', status: 0
                }
            );

            this.instance_token = `SLY-${func.encodeUnify(this.instance_id, 'sly')}`;

            await this.updateInstance({salary_token: this.instance_token, status: 1});

            return {salary_token: this.instance_token, salary_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findSalaryListInRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_salary', ['salary_token', 'cdate', 'udate', 'receipt', 'status'])
                .configComplexConditionKeys('vn_driver', ['name', 'cell', 'email', 'img_path', 'driver_token'])
                .configComplexConditionKey('vn_coin', 'amount')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_salary')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_driver')
                .configComplexOrder(order_key, order_direction, 'vn_salary')
                .configStatusCondition(status)
                .configComplexConditionJoins('vn_salary',
                    [
                        {key: 'coin_id', tar: 'vn_coin'},
                        {key: 'driver_id', tar: 'driver_id'}
                    ]
                )
                .configComplexConditionQueryItem('vn_salary', 'realm_id', realm_id)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_salary', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_salary', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list};

        } catch (e) {
            throw e;
        }
    }

    static async findSalaryListWithDriver(search_query = {}, realm_id, driver_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_salary', ['salary_token', 'cdate', 'udate', 'receipt', 'status'])
                .configComplexConditionKey('vn_coin', 'amount')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_salary')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_driver')
                .configComplexOrder(order_key, order_direction, 'vn_salary')
                .configStatusCondition(status)
                .configComplexConditionJoins('vn_salary',
                    [
                        {key: 'coin_id', tar: 'vn_coin'},
                        {key: 'driver_id', tar: 'driver_id'}
                    ]
                )
                .configComplexConditionQueryItem('vn_salary', 'driver_id', driver_id)
                .configComplexConditionQueryItem('vn_salary', 'realm_id', realm_id)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_salary', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_salary', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list};

        } catch (e) {
            throw e;
        }
    }

    static async findSalarySumWithDriver(search_query = {}, realm_id, driver_id) {
        try {

            const {date_from, date_to, from_key, to_key} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('SUM(vn_coin.amount) AS count')
                .configComplexConditionJoin('vn_salary', 'coin_id', 'vn_coin')
                .configComplexConditionQueryItem('vn_salary', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_salary', 'driver_id', driver_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_salary')
                .configStatusCondition(1, 'vn_salary');


            const [{sum}] = await this.findInstanceListWithComplexCondition('vn_salary', conditions);

            return parseInt(sum) || 0;
        } catch (e) {
            throw e;
        }
    }

    static async findSalarySumInRealm(search_query = {}, realm_id) {
        try {

            const {date_from, date_to, from_key, to_key} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('SUM(vn_coin.amount) AS count')
                .configComplexConditionJoin('vn_salary', 'coin_id', 'vn_coin')
                .configComplexConditionQueryItem('vn_salary', 'realm_id', realm_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_salary')
                .configStatusCondition(1, 'vn_salary');


            const [{sum}] = await this.findInstanceListWithComplexCondition('vn_salary', conditions);

            return parseInt(sum) || 0;

        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNSalary;