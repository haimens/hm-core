const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNPaymentResource extends ODInstance {


    constructor(payment_resource_token, payment_resource_id) {
        super('vn_payment_resource', 'payment_resource_token', payment_resource_token, payment_resource_id);
    }

    async registerPaymentResource(info = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        const {square_application_id, square_location_id, square_access_token} = info;
        if (!square_application_id) func.throwErrorWithMissingParam('square_application_id');
        if (!square_location_id) func.throwErrorWithMissingParam('square_location_id');
        if (!square_access_token) func.throwErrorWithMissingParam('square_access_token');

        try {

            this.instance_id = await this.insertInstance({
                realm_id, square_application_id, square_location_id, square_access_token,
                cdate: 'now()', udate: 'now()', status: 0
            });

            this.instance_token = `PR-${func.encodeUnify(this.instance_id, 'pr')}`;

            await this.updateInstance({payment_resource_token: this.instance_token, status: 1});

            return {payment_resource_token: this.instance_token, payment_resource_id: this.instance_id}
        } catch (e) {
            throw e;
        }
    }

    static async findPaymentResourceListWithRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_payment_resource', ['square_application_id', 'square_location_id', 'square_access_token'])
                .configComplexConditionQueryItem('vn_payment_resource', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_payment_resource')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_payment_resource')
                .configKeywordCondition(['sendgrid_from_payment'], keywords, 'vn_payment_resource')
                .configStatusCondition(status, 'vn_payment_resource')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_payment_resource', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_payment_resource', conditions);


            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};

        } catch (e) {
            throw e;
        }
    }

    static async findPrimaryPaymentResourceWithRealm(realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKey('vn_realm', 'company_name')
                .configComplexConditionKeys(
                    'vn_payment_resource',
                    ['square_application_id', 'square_location_id', 'square_access_token']
                )
                .configComplexConditionJoin('vn_realm', 'primary_payment_resource_id', 'vn_payment_resource')
                .configComplexConditionQueryItem('vn_realm', 'id', realm_id)
                .configQueryLimit(0, 1);

            const [record] = await this.findInstanceListWithComplexCondition('vn_realm', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNPaymentResource;