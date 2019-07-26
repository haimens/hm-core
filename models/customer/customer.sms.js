const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNCustomerSMS extends ODInstance {

    constructor(sms_token, sms_id) {
        super('vn_customer_sms', 'sms_token', sms_token, sms_id);
    }

    async registerCustomerSMS(info = {}, customer_id, realm_id) {
        const {tar_cell, sys_cell, message, type, smsid, is_read, driver_id, lord_id} = info;
        if (!tar_cell) func.throwErrorWithMissingParam('tar_cell');
        if (!sys_cell) func.throwErrorWithMissingParam('sys_cell');
        if (!message) func.throwErrorWithMissingParam('message');
        if (!smsid) func.throwErrorWithMissingParam('smsid');

        const trimed_tar = tar_cell.replace(' ', '');
        try {

            this.instance_id = await this.insertInstance(
                {
                    tar_cell: trimed_tar, sys_cell, message, type, smsid,
                    cdate: 'now()', udate: 'now()',
                    customer_id: (customer_id || 0), realm_id: (realm_id || 0),
                    is_read, driver_id, lord_id,
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
                .configComplexConditionKey('vn_customer', 'customer_token')
                .configComplexConditionJoin('vn_customer_sms', 'customer_id', 'vn_customer')
                .configSimpleCondition(`vn_customer_sms.tar_cell = '${tar_cell}'`)
                .configSimpleCondition(`vn_customer_sms.sys_cell = '${sys_cell}'`)
                .configComplexOrder('udate', 'DESC', ['udate'], 'vn_customer_sms')
                .configComplexConditionQueryItem('vn_customer_sms', 'status', 1)
                .configQueryLimit(0, 1);


            const [record] = await this.findInstanceListWithComplexCondition('vn_customer_sms', conditions);


            return record || {};


        } catch (e) {

            throw e;
        }
    }

    static async findSMSListWithRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_customer_sms',
                    ['tar_cell', 'sys_cell', 'cdate', 'udate', 'message', 'type', 'is_read', 'sms_token']
                )
                .configComplexConditionKeys('vn_customer', ['name', 'username', 'email', 'img_path', 'customer_token'])
                .configComplexConditionJoin('vn_customer_sms', 'customer_id', 'vn_customer')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_customer_sms')
                .configKeywordCondition(['message'], keywords, 'vn_customer_sms')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_customer')
                .configComplexConditionQueryItem('vn_customer_sms', 'realm_id', realm_id)
                .configStatusCondition(1, 'vn_customer_sms')
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

    static async findCustomerSMSGroupedMessageInRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start} = search_query;
            const conditions = new ODCondition();

            conditions

                .configComplexConditionKeys('sms1',
                    ['tar_cell', 'sys_cell', 'cdate', 'udate', 'message', 'type', 'is_read', 'sms_token']
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    ['name', 'username', 'email', 'img_path', 'cell', 'customer_token']
                )
                .configSimpleJoin(`
                    LEFT JOIN vn_customer_sms AS sms2 ON (
                        sms1.customer_id = sms2.customer_id AND sms1.id < sms2.id 
                    )`
                )
                .configComplexConditionJoin('sms1', 'customer_id', 'vn_customer')
                .configSimpleCondition('sms2.id IS NULL')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'sms1')
                .configKeywordCondition(['message'], keywords, 'sms1')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_customer')
                .configComplexConditionQueryItem('sms1', 'realm_id', realm_id)
                .configStatusCondition(1, 'sms1')
                .configComplexOrder('udate', 'DESC', ['udate'], 'sms1')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_customer_sms', conditions, 'sms1');

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_customer_sms AS sms1', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};

        } catch (e) {
            throw e;
        }

    }

    static async findSMSListWithCustomer(search_query = {}, customer_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_customer_sms',
                    ['tar_cell', 'sys_cell', 'cdate', 'udate', 'message', 'type', 'is_read', 'sms_token']
                )
                .configComplexConditionKeys(
                    'vn_driver',
                    ['name AS driver_name', 'cell AS driver_cell', 'driver_token', 'img_path AS driver_img_path']
                )
                .configComplexConditionKeys(
                    'vn_lord',
                    ['name AS lord_name', 'cell AS lord_cell', 'lord_token', 'img_path AS lord_img_path']
                )
                .configComplexConditionKeys('vn_customer', ['name', 'username', 'email', 'img_path', 'customer_token'])
                .configComplexConditionJoin('vn_customer_sms', 'customer_id', 'vn_customer')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_customer_sms')
                .configKeywordCondition(['message'], keywords, 'vn_customer_sms')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_customer')
                .configComplexConditionQueryItem('vn_customer_sms', 'customer_id', customer_id)
                .configComplexConditionJoins('vn_customer_sms',
                    [
                        {key: 'driver_id', tar: 'vn_driver'},
                        {key: 'lord_id', tar: 'vn_lord'}
                    ]
                )
                .configStatusCondition(1, 'vn_customer_sms')
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