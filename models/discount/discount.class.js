const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNDiscount extends ODInstance {

    constructor(discount_token, discount_id) {
        super('vn_discount', 'discount_token', discount_token, discount_id);
    }

    async registerDiscountDetail(info = {}, realm_id) {
        const {vdate, amount, rate, type, min_price, available_usage, code} = info;

        console.log(info);
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        if (!vdate) func.throwErrorWithMissingParam('vdate');
        if (!type) func.throwErrorWithMissingParam('type');
        if (!min_price) func.throwErrorWithMissingParam('min_price');

        if (!available_usage) func.throwErrorWithMissingParam('available_usage');
        if (!code) func.throwErrorWithMissingParam('code');
        try {


            const count = await VNDiscount._findCodeCount(code);

            if (count !== 0) func.throwError('CODE EXISTED');
            this.instance_id = await this.insertInstance(
                {vdate, amount, rate, type, min_price, available_usage, cdate: 'now()', udate: 'now()', code, realm_id}
            );

            this.instance_token = `DNT-${func.encodeUnify(this.instance_id, 'disc')}`;

            await this.updateInstance({discount_token: this.instance_token, status:1});

            return {discount_token: this.instance_token, discount_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async _findCodeCount(code) {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('COUNT(vn_discount.id) AS count')
                .configComplexConditionQueryItem('vn_discount', 'code', code)
                .configStatusCondition(1, 'vn_discount');

            const [{count}] = await this.findInstanceListWithComplexCondition('vn_discount', conditions);

            return parseInt(count) || 0;

        } catch (e) {
            throw e;
        }
    }

    async findDiscountInfoWithKey(code, realm_id) {
        if (!code) func.throwErrorWithMissingParam('code');
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_discount',
                    [
                        'id AS discount_id',
                        'type', 'rate', 'amount',
                        'min_price', 'vdate', 'available_usage',
                        'discount_token', 'status'
                    ]
                )
                .configComplexConditionQueryItem(
                    'vn_discount', 'code', code
                )
                .configComplexConditionQueryItem(
                    'vn_discount', 'realm_id', realm_id
                );

            const [{discount_id, ...record}] = await VNDiscount.findInstanceListWithComplexCondition(
                'vn_discount', conditions
            );

            this.instance_id = discount_id;
            return {discount_id, ...record};
        } catch (e) {
            throw e;
        }
    }

    static async findDiscountListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_discount',
                    ['type', 'rate', 'amount',
                        'min_price', 'cdate', 'udate', 'vdate', 'available_usage',
                        'discount_token', 'status']
                )
                .configComplexConditionQueryItem(
                    'vn_discount', 'realm_id', realm_id
                )
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_discount')
                .configKeywordCondition(
                    ['code'], keywords, 'vn_discount'
                )
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'],'vn_discount')
                .configStatusCondition(status, 'vn_discount')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_discount', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_discount', conditions
            );

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNDiscount;