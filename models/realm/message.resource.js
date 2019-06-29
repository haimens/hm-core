const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNMessageResource extends ODInstance {


    constructor(message_resource_token, message_resource_id) {
        super('vn_message_resource', 'message_resource_token', message_resource_token, message_resource_id);
    }

    async registerMessageResource(info, realm_id) {
        try {
            const {twilio_account_id, twilio_auth_token, twilio_from_num} = info;

            if (!twilio_from_num) func.throwErrorWithMissingParam('twilio_from_num');
            if (!twilio_account_id) func.throwErrorWithMissingParam('twilio_account_id');
            if (!twilio_auth_token) func.throwErrorWithMissingParam('twilio_auth_token');

            this.instance_id = await this.insertInstance({

                realm_id,
                twilio_account_id,
                twilio_auth_token,
                twilio_from_num,
                cdate: 'now()',
                udate: 'now()',
                status: 0
            });

            this.instance_token = `MRT-${func.encodeUnify(this.instance_id, 'mrt')}`;

            await this.updateInstance({message_resource_token: this.instance_token, status: 1});

            return {message_resource_id: this.instance_id, message_resource_token: this.instance_token}
        } catch (e) {
            throw e;
        }
    }

    static async findMessageResourceListWithRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_message_resource', ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num'])
                .configComplexConditionQueryItem('vn_message_resource', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_message_resource')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_message_resource')
                .configKeywordCondition(['twilio_from_num'], keywords, 'vn_message_resource')
                .configStatusCondition(status, 'vn_message_resource')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_message_resource', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_message_resource', conditions);


            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};

        } catch (e) {
            throw e;
        }
    }

    static async findPrimaryMessageResourceWithRealm(realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKey('vn_realm', 'company_name')
                .configComplexConditionKeys('vn_message_resource', ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num'])
                .configComplexConditionJoin('vn_realm', 'primary_message_resource_id', 'vn_message_resource')
                .configComplexConditionQueryItem('vn_realm', 'id', realm_id)
                .configQueryLimit(0, 1);

            const [record] = await this.findInstanceListWithComplexCondition('vn_realm', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNMessageResource;