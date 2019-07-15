const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');

class VNOrder extends ODInstance {

    constructor(order_token, order_id) {
        super('vn_order', 'order_token', order_token, order_id);
    }

    async registerOrder(info = {}, realm_id) {

        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {lord_id, customer_id, contact_name, contact_cell, type} = info;

            if (!customer_id) func.throwErrorWithMissingParam('customer_id');
            if (!contact_name) func.throwErrorWithMissingParam('contact_name');
            if (!contact_cell) func.throwErrorWithMissingParam('contact_cell');
            if (!type) func.throwErrorWithMissingParam('type');

            this.instance_id = await this.insertInstance(
                {
                    lord_id: lord_id || 0, customer_id, contact_name, contact_cell, type,
                    realm_id,
                    cdate: 'now()', udate: 'now()', status: 0
                }
            );

            this.instance_token = `ORD-${func.encodeUnify(this.instance_id, 'ord')}`;

            await this.updateInstance({order_token: this.instance_token, status: 1});

            return {order_token: this.instance_token, order_id: this.instance_id};

        } catch (e) {
            throw e;
        }
    }

    async findOrderFullDetail() {

        try {
            if (!this.instance_id) {
                if (!this.instance_token) func.throwErrorWithMissingParam('instance_token');
                const {vn_order_id: order_id} = await this.findInstanceDetailWithToken();
                this.instance_id = order_id;
            }

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    [
                        'cdate', 'udate', 'customer_id',
                        'contact_name', 'contact_cell', 'receipt',
                        'order_token'
                    ])
                .configComplexConditionKey(
                    'vn_order_type', 'name', 'order_type'
                )
                .configComplexConditionKeys('vn_lord',
                    ['lord_token', 'name AS lord_name', 'cell AS lord_cell', 'img_path AS lord_img_path']
                )
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionKey('vn_order_status', 'name', 'status_str')
                .configComplexConditionJoin('vn_order', 'type', 'vn_order_type')
                .configComplexConditionJoin('vn_order', 'coin_id', 'vn_coin')
                .configComplexConditionJoin('vn_order', 'lord_id', 'vn_lord')
                .configStatusJoin('vn_order', 'vn_order_status')
                .configComplexConditionQueryItem('vn_order', 'id', this.instance_id);


            const [record] = await VNOrder.findInstanceListWithComplexCondition('vn_order', conditions);


            return record;

        } catch (e) {
            throw e;
        }

    }

    static async findOrderListInRealm(search_query = {}, realm_id) {

        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    [
                        'cdate', 'udate',
                        'contact_name', 'contact_cell', 'receipt',
                        'order_token'
                    ])
                .configComplexConditionKey(
                    'vn_order_type', 'name', 'order_type'
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    [
                        'name AS customer_name', 'cell AS customer_cell',
                        'email AS customer_email', 'customer_token', 'note AS customer_note',
                        'img_path', 'username'
                    ]
                )
                .configComplexConditionKey('vn_order_status', 'name', 'status_str')
                .configComplexConditionJoin('vn_order', 'type', 'vn_order_type')
                .configStatusJoin('vn_order', 'vn_order_status')
                .configComplexConditionJoin('vn_order', 'customer_id', 'vn_customer')
                .configComplexConditionQueryItem('vn_order', 'realm_id', realm_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_order')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_order')
                .configKeywordCondition(['contact_cell', 'contact_name'], keywords, 'vn_order')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_customer')
                .configStatusCondition(status, 'vn_order')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_order', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_order', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findOrderListWithCustomer(search_query = {}, realm_id, customer_id) {

        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    [
                        'cdate', 'udate',
                        'contact_name', 'contact_cell', 'receipt',
                        'order_token'
                    ])
                .configComplexConditionKey(
                    'vn_order_type', 'name', 'order_type'
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    [
                        'name AS customer_name', 'cell AS customer_cell',
                        'email AS customer_email', 'customer_token', 'note AS customer_note',
                        'img_path', 'username'
                    ]
                )
                .configComplexConditionKey('vn_order_status', 'name', 'status_str')
                .configComplexConditionJoin('vn_order', 'type', 'vn_order_type')
                .configStatusJoin('vn_order', 'vn_order_status')
                .configComplexConditionJoin('vn_order', 'customer_id', 'vn_customer')
                .configComplexConditionQueryItem('vn_order', 'realm_id', realm_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_order')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_order')
                .configKeywordCondition(['contact_cell', 'contact_name'], keywords, 'vn_order')
                .configComplexConditionQueryItem('vn_order', 'customer_id', customer_id)
                .configStatusCondition(status, 'vn_order')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_order', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_order', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    async confirmOrderStatus() {
        try {
            if (!this.instance_id) {
                if (!this.instance_token) func.throwErrorWithMissingParam('instance_token');

                const {vn_order_id: order_id} = await this.findInstanceDetailWithToken();
                this.instance_id = order_id;
            }

            const order_query = `UPDATE vn_order SET vn_order.status = 3 WHERE vn_order = $${this.instance_id}`;
            const trip_query = `
            UPDATE vn_trip SET vn_trip.status = 2 
            WHERE vn_trip.order_id = ${this.instance_id} 
            AND vn_trip.status != 0
            `;

            const results = await Promise.all([VNOrder.performQuery(order_query), VNOrder.performQuery(trip_query)]);

            return {result_list: results};
        } catch (e) {
            throw e;
        }

    }

    async cancelOrderStatus() {
        try {
            if (!this.instance_id) {
                if (!this.instance_token) func.throwErrorWithMissingParam('instance_token');

                const {vn_order_id: order_id} = await this.findInstanceDetailWithToken();
                this.instance_id = order_id;
            }

            const order_query = `UPDATE vn_order SET vn_order.status = 0 WHERE vn_order = $${this.instance_id}`;
            const trip_query = `
            UPDATE vn_trip SET vn_trip.status = 0 
            WHERE vn_trip.order_id = ${this.instance_id} 
            AND vn_trip.status != 0
            `;

            const results = await Promise.all([VNOrder.performQuery(order_query), VNOrder.performQuery(trip_query)]);

            return {result_list: results};
        } catch (e) {
            throw e;
        }

    }

    static async findOrderFinalPrice(order_id, realm_id) {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionJoin('vn_order', 'coin_id', 'vn_coin')
                .configComplexConditionQueryItem('vn_order', 'order_id', order_id)
                .configComplexConditionQueryItem('vn_order', 'realm_id', realm_id);


            const [{amount}] = await this.findInstanceListWithComplexCondition('vn_order', conditions);

            return parseInt(amount) || 0;

        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNOrder;