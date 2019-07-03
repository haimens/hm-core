const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNDiscount extends ODInstance {

    constructor(discount_token, discount_id) {
        super('vn_discount', 'discount_token', discount_token, discount_id);
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
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'])
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