const ODInstance = require('../instance.model');

const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNInvoice extends ODInstance {

    constructor(invoice_token, invoice_id) {
        super('vn_invoice', 'invoice_token', invoice_token, invoice_id);
    }

    async registerInvoice(realm_id, coin_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            this.instance_id = await this.insertInstance(
                {coin_id, cdate: 'now()', udate: 'now()', realm_id, status: 0}
            );

            this.instance_token = `INV-${func.encodeUnify(this.instance_id, 'inv')}`;

            await this.updateInstance({invoice_token: this.instance_token, status: 1});

            return {invoice_token: this.instance_token, invoice_id: this.instance_id};

        } catch (e) {
            throw e;
        }
    }


    static async findInvoiceListInSystem(search_query = {}) {
        try {

            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_invoice', ['invoice_token', 'cdate', 'udate', 'receipt', 'status'])
                .configComplexConditionKey(
                    'vn_invoice_status', 'name', 'status_str'
                )
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionKeys(
                    'vn_realm', ['realm_token', 'company_name', 'company_title']
                )
                .configComplexConditionJoin('vn_invoice', 'coin_id', 'vn_coin')
                .configStatusJoin('vn_invoice', 'vn_invoice_status')
                .configComplexConditionJoin('vn_invoice', 'realm_id', 'vn_realm')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_invoice')
                .configKeywordCondition(['receipt'], keywords, 'vn_invoice')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_invoice')
                .configStatusCondition(status, 'vn_invoice')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_invoice', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_invoice', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findInvoiceListWithRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {

            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_invoice', ['invoice_token', 'cdate', 'udate', 'receipt', 'status'])
                .configComplexConditionKey(
                    'vn_invoice_status', 'name', 'status_str'
                )
                .configComplexConditionKey('vn_coin', 'amount')
                .configComplexConditionKeys(
                    'vn_realm', ['realm_token', 'company_name', 'company_title']
                )
                .configComplexConditionJoin('vn_invoice', 'coin_id', 'vn_coin')
                .configStatusJoin('vn_invoice', 'vn_invoice_status')
                .configComplexConditionJoin('vn_invoice', 'realm_id', 'vn_realm')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_invoice')
                .configKeywordCondition(['receipt'], keywords, 'vn_invoice')
                .configComplexConditionQueryItem('vn_invoice', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_invoice')
                .configStatusCondition(status, 'vn_invoice')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_invoice', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_invoice', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }


    static async findInvoiceSumWithRealm(search_query = {}, realm_id) {
        try {

            const {status, date_from, date_to, from_key, to_key} = search_query;


            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey('SUM(vn_coin.amount) AS sum ')
                .configComplexConditionJoin('vn_invoice', 'coin_id', )
                .configStatusCondition(status, 'vn_invoice')
                .configComplexConditionQueryItem('vn_invoice', 'realm_id', realm_id)

            const query = `
                SELECT SUM(vn_coin.amount) AS sum 
                FROM vn_invoice 
                LEFT JOIN vn_coin ON vn_invoice.coin_id = vn_coin.id 
                WHERE vn_invoice.realm_id = ${realm_id} 
                AND vn_invoice.status = ${status || '2'}
            `;

            const [{sum}] = await this.performQuery(query);

            return parseInt(sum) || 0;

        } catch (e) {
            throw e;
        }
    }

    static async findInvoiceSumInSystem(search_query = {}) {
        try {

            const {status} = search_query;
            const query = `
                SELECT SUM(vn_coin.amount) AS sum 
                FROM vn_invoice 
                LEFT JOIN vn_coin ON vn_invoice.coin_id = vn_coin.id 
                WHERE vn_invoice.status = ${status || '2'}
            `;

            const [{sum}] = await this.performQuery(query);


            return parseInt(sum) || 0;

        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNInvoice;