const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNOrderNote extends ODInstance {


    constructor(order_note_token, order_note_id) {
        super('vn_order_note', 'order_note', order_note_token, order_note_id);
    }

    async registerOrderNote(info = {}, realm_id, customer_id, order_id, trip_id) {

        const {note, type} = info;
        if (!note) func.throwErrorWithMissingParam('note');
        if (!type) func.throwErrorWithMissingParam('type');
        try {
            this.instance_id = await this.insertInstance(
                {
                    note, type, cdate: 'now()', udate: 'now()', order_id: order_id || 0,
                    customer_id, realm_id, status: 0
                }
            );

            this.instance_token = `ONR-${func.encodeUnify(this.instance_id, 'onr')}`;

            await this.updateInstance({order_note_token: this.instance_token, status: 1});


            return {order_note_token: this.instance_token, order_note_id: this.instance_id};

        } catch (e) {
            throw e;
        }
    }


    static async findOrderNoteListWithCustomer(search_query = {}, realm_id, customer_id) {

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_order_note', ['note', 'order_note_token', 'cdate', 'udate', 'type', 'status'])
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionKey('vn_customer', 'customer_token')
                .configComplexConditionJoins(
                    'vn_order_note',
                    [
                        {key: 'customer_id', tar: 'vn_customer'},
                        {key: 'order_id', tar: 'vn_order'}
                    ])
                .configComplexConditionQueryItem('vn_order_note', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_order_note', 'customer_id', customer_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_order_note')
                .configStatusCondition(status, 'vn_order_note')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_order_note')
                .configKeywordCondition(['note'], keywords, 'vn_order_note')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_order_note', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_order_note', conditions
            );

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }

    }

    static async findOrderNoteListWithOrder(search_query = {}, realm_id, order_id) {
        try {

            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_order_note', ['note', 'order_note_token', 'cdate', 'udate', 'type', 'status'])
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionKey('vn_customer', 'customer_token')
                .configComplexConditionJoins(
                    'vn_order_note', [
                        {key: 'order_id', tar: 'vn_order'},
                        {key: 'customer_id', tar: 'vn_customer'},
                    ])
                .configComplexConditionQueryItem('vn_order_note', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_order_note', 'order_id', order_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_order_note')
                .configStatusCondition(status, 'vn_order_note')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_order_note')
                .configKeywordCondition(['note'], keywords, 'vn_order_note')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_order_note', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_order_note', conditions
            );

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findOrderNoteListWithTrip(search_query = {}, realm_id, order_id, customer_id, trip_id) {

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_order_note', ['note', 'order_note_token', 'cdate', 'udate', 'type', 'status'])
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionKey('vn_customer', 'customer_token')
                .configComplexConditionJoins(
                    'vn_order_note', [
                        {key: 'order_id', tar: 'vn_order'},
                        {key: 'customer_id', tar: 'vn_customer'},
                        {key: 'trip_id', tar: 'vn_trip'}
                    ])
                .configComplexConditionQueryItem('vn_order_note', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_order_note', 'order_id', order_id)
                .configComplexConditionQueryItem('vn_order_note', 'trip_id', trip_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_order_note')
                .configStatusCondition(status, 'vn_order_note')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_order_note')
                .configKeywordCondition(['note'], keywords, 'vn_order_note')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_order_note', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_order_note', conditions
            );

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }

    }
}

module.exports = VNOrderNote;