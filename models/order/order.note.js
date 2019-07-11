const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNOrderNote extends ODInstance {

    async registerOrderNote(info = {}, customer_id, realm_id, order_id) {

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

    static async findOrderNoteListWithOrder(search_query = {}, order_id, realm_id) {
        try {

            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_order_note', ['note', 'order_note_token', 'cdate', 'udate', 'type', 'status'])
                .configComplexConditionKey('vn_order', 'order_token')
                .configComplexConditionJoin('vn_order_note', 'order_id', 'vn_order')
                .configComplexConditionQueryItem('vn_order_note')

        } catch (e) {
            throw e;
        }
    }

    static async findOrderNoteListWithCustomer(search_query = {}, customer_id, realm_id) {

    }

    static async findOrderNoteListWithTrip(search_query = {}, customer_id, realm_id) {

    }
}

module.exports = VNOrderNote;