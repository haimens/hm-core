const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNCustomerSMS extends ODInstance {

    constructor(sms_token, sms_id) {
        super('vn_customer_sms', 'sms_token', sms_token, sms_id);
    }

    async registerCustomerSMS(info = {}, customer_id, realm_id) {
        const {tar_cell, sys_cell, message, type, smsid} = info;
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
}

module.exports = VNCustomerSMS;