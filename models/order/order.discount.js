const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNOrderDiscount extends ODInstance {

    constructor(order_discount_token, order_discount_id) {
        super('vn_order_discount', 'order_discount_token', order_discount_token, order_discount_id);
    }


    async registerOrderDiscount(order_id, customer_id, realm_id, discount_id) {
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!customer_id) func.throwErrorWithMissingParam('customer_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!discount_id) func.throwErrorWithMissingParam('discount_id');

        try {
            this.instance_id = await this.insertInstance({
                order_id, customer_id, realm_id, discount_id,
                cdate: 'now()', udate: 'now()', status: 0
            });

            this.instance_token = `ODR-${func.encodeUnify(this.instance_id, 'odr')}`;

            await this.updateInstance({order_discount_token: this.instance_token, status: 1});

            return {order_discount_token: this.instance_token, order_discount_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findOrderDiscountListWithOrder(order_id, realm_id) {
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_order_discount',
                    ['order_discount_token', 'cdate', 'udate']
                )
                .configComplexConditionKeys(
                    'vn_discount',
                    [
                        'type', 'rate', 'amount', 'code',
                        'min_price', 'vdate', 'available_usage', 'discount_token'
                    ]
                )
                .configComplexConditionJoin(
                    'vn_order_discount',
                    'discount_id',
                    'vn_discount'
                )
                .configStatusCondition(1, 'vn_order_discount')
                .configComplexConditionQueryItem(
                    'vn_order_discount', 'order_id', order_id
                )
                .configComplexConditionQueryItem(
                    'vn_order_discount', 'realm_id', realm_id
                );

            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_order_discount', conditions
            );

            return {record_list};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNOrderDiscount;