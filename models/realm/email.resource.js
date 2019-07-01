const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNEmailResource extends ODInstance {

    constructor(email_resource_token, email_resource_id) {
        super('vn_email_resource', 'email_resource_token', email_resource_token, email_resource_id);
    }

    async registerEmailResource(info = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        const {sendgrid_api_key, sendgrid_from_email} = info;
        if (!sendgrid_api_key) func.throwErrorWithMissingParam('sendgrid_api_key');
        if (!sendgrid_from_email) func.throwErrorWithMissingParam('sendgrid_from_email');

        try {

            this.instance_id = await this.insertInstance({
                realm_id, sendgrid_api_key, sendgrid_from_email,
                cdate: 'now()', udate: 'now()', status: 0
            });

            this.instance_token = `ER-${func.encodeUnify(this.instance_id, 'er')}`;

            await this.updateInstance({email_resource_token: this.instance_token, status: 1});

            return {email_resource_token: this.instance_token, email_resource_id: this.instance_id}
        } catch (e) {
            throw e;
        }
    }

    static async findEmailResourceListWithRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_email_resource',
                    ['sendgrid_api_key', 'sendgrid_from_email', 'email_resource_token'])
                .configComplexConditionQueryItem('vn_email_resource', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_email_resource')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_email_resource')
                .configKeywordCondition(['sendgrid_from_email'], keywords, 'vn_email_resource')
                .configStatusCondition(status, 'vn_email_resource')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_email_resource', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_email_resource', conditions);


            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};

        } catch (e) {
            throw e;
        }
    }

    static async findPrimaryEmailResourceWithRealm(realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKey('vn_realm', 'company_name')
                .configComplexConditionKeys('vn_email_resource',
                    ['sendgrid_api_key', 'sendgrid_from_email', 'email_resource_token']
                )
                .configComplexConditionJoin('vn_realm', 'primary_email_resource_id', 'vn_email_resource')
                .configComplexConditionQueryItem('vn_realm', 'id', realm_id)
                .configQueryLimit(0, 1);

            const [record] = await this.findInstanceListWithComplexCondition('vn_realm', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNEmailResource;