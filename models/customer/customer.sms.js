const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNCustomerSMS extends ODInstance {

    constructor(sms_token, sms_id) {
        super('vn_customer_sms', 'sms_token', sms_token, sms_id);
    }

    async registerCustomerSMS(info = {}, customer_id, realm_id) {
        const {tar_cell, sys_cell, message, type, smsid, is_read} = info;
        if (!tar_cell) func.throwErrorWithMissingParam('tar_cell');
        if (!sys_cell) func.throwErrorWithMissingParam('sys_cell');
        if (!message) func.throwErrorWithMissingParam('message');
        if (!smsid) func.throwErrorWithMissingParam('smsid');
        try {

            this.instance_id = await this.insertInstance(
                {
                    tar_cell, sys_cell, message, type, smsid,
                    cdate: 'now()', udate: 'now()',
                    customer_id: (customer_id || 0), realm_id: (realm_id || 0),
                    is_read: (is_read || 1),
                    status: 0
                }
            );

            this.instance_token = `SMS-${func.encodeUnify(this.instance_id, 'sms')}`;

            await this.updateInstance({sms_token: this.instance_token, status: 1});
            return {sms_token: this.instance_token, sms_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findCustomerSMSRecordWithIncomingReply(tar_cell, sys_cell) {
        if (!tar_cell) func.throwErrorWithMissingParam('tar_cell');
        if (!sys_cell) func.throwErrorWithMissingParam('sys_cell');

        try {


            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_customer_sms',
                    ['customer_id', 'realm_id']
                )
                .configComplexConditionQueryItem('vn_customer_sms', 'tar_cell', tar_cell)
                .configComplexConditionQueryItem('vn_customer_sms', 'sys_cell', sys_cell)
                .configComplexOrder('udate', 'DESC', ['udate'], 'vn_customer_sms')
                .configComplexConditionQueryItem('vn_customer_sms', 'status', 1)
                .configQueryLimit(0, 1);

            const [record] = await this.findInstanceListWithComplexCondition('vn_customer_sms', conditions);

            return record || {};


        } catch (e) {

        }
    }

    static async findSMSListWithRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_customer_sms',
                    ['tar_cell', 'sys_cell', 'cdate', 'udate', 'message', 'type', 'is_read']
                )
                .configComplexConditionKeys('vn_customer', ['name', 'username', 'email', 'img_path'])
                .configComplexConditionJoin('vn_customer_sms', 'customer_id', 'vn_customer')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_customer_sms')
                .configKeywordCondition(['message'], keywords, 'vn_customer_sms')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_customer')
                .configComplexConditionQueryItem('vn_customer_sms', 'realm_id', realm_id)
                .configStatusCondition(1, 'vn_customer')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_customer_sms')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_customer_sms', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_customer_sms', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNCustomerSMS;