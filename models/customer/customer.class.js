const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');
const HNApp = require('@odinternational/od-havana-conn');

class VNCustomer extends ODInstance {
    constructor(customer_token, customer_id) {
        super('vn_customer', 'customer_token', customer_token, customer_id);
    }

    static async findCustomerWithInfo(username) {
        if (!username) func.throwErrorWithMissingParam('username');
        try {
            const query = `
                SELECT id as customer_id, customer_token
                FROM vn_customer
                WHERE username = '${username}'
                AND (status = 2 OR status = 1)
                LIMIT 0,1
            `;

            const [record] = await this.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }

    async registerCustomer(customer_info = {}, realm_id, address_id) {
        if (!customer_info) func.throwErrorWithMissingParam('customer_info');

        const {name, cell, email, img_path} = customer_info;
        if (!name) func.throwErrorWithMissingParam('name');
        if (!cell) func.throwErrorWithMissingParam('cell');
        if (!email) func.throwErrorWithMissingParam('email');


        if (!realm_id) func.throwErrorWithMissingParam('realm_id');


        try {
            const customerApp = new HNApp(process.env.CUSTOMER_APP_TOKEN, process.env.CUSTOMER_APP_KEY);


            let avatar = img_path;
            if (!img_path) {
                const {image_path} = await customerApp.findRandomImageWithService('avatar');
                avatar = image_path;
            }

            let flag = true;

            let count = 1;
            let username = '';

            const name_parts = name.split(' ');
            const first_name = name_parts[0], last_name = name_parts.pop();
            const base = name.split(' ').join('');
            while (flag) {
                const count_str = `0000${count}`.slice(-4);
                username = `${base}${count_str}`.toLowerCase();
                const checkRes = await customerApp.checkUsernameExist(username);
                flag = checkRes.is_exist;
                count++;
            }

            const {instance_token: customer_key} = await customerApp.signupUserInstance(
                username, username, email, first_name, last_name, cell
            );

            this.instance_id = await this.insertInstance({
                name,
                cell,
                email,
                username,
                customer_key,
                cdate: 'now()',
                udate: 'now()',
                realm_id,
                img_path: avatar,
                address_id: address_id || 0,
                status: 1
            });

            this.instance_token = `CTM-${func.encodeUnify(this.instance_id, 'ctm')}`;

            await this.updateInstance({customer_token: this.instance_token, username, status: 2});

            return {customer_id: this.instance_id, customer_token: this.instance_token, username, name};
        } catch (err) {
            throw err;
        }
    }

    static async findCustomerTokenWithKey(customer_key) {
        if (!customer_key) func.throwErrorWithMissingParam('customer_key');

        try {
            const query = `
                SELECT customer_token
                FROM vn_customer
                WHERE customer_key = '${customer_key}'
                LIMIT 0,1
            `;

            const [record] = await VNCustomer.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }


    static async findCustomerListInRealm(realm_id, search_query) {
        try {
            if (!realm_id) func.throwErrorWithMissingParam('realm_id');


            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys('vn_customer', ['name', 'cell', 'email', 'img_path', 'username'])
                .configComplexConditionKeys('vn_address', ['addr_str', 'lat', 'lng'])
                .configComplexConditionJoin('vn_customer', 'address_id', 'vn_address')
                .configComplexConditionQueryItem('vn_customer', 'realm_id', realm_id)
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_customer')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_customer')
                .configStatusCondition(status, 'vn_customer')
                .configKeywordCondition(['cell', 'name', 'email', 'username'], keywords, 'vn_customer')
                .configKeywordCondition(['addr_str'], keywords, 'vn_address')
                .configQueryLimit(start, 30);

            const count = await VNCustomer.findCountOfInstance('vn_customer', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await VNCustomer.findInstanceListWithComplexCondition('vn_customer', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length}
        } catch (e) {
            throw e;
        }
    }

    static async findCustomerInfoWithIncomingSMS(cell) {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionJoin('vn_customer', 'realm_id', 'vn_realm')
                .configComplexConditionKeys('vn_customer', ['id AS customer_id', 'realm_id'])
                .configComplexConditionQueryItem('vn_customer', 'cell', cell)
                .configComplexOrder('udate', 'DESC', ['udate'], 'vn_customer')
                .configQueryLimit(0, 1)
                .configStatusCondition(2, 'vn_customer')
                .configStatusCondition(2, 'vn_realm');


            const [record] = await this.findInstanceListWithComplexCondition('vn_customer', conditions);

            return record;
        } catch
            (e) {
            throw e;
        }
    }
}

module
    .exports = VNCustomer;