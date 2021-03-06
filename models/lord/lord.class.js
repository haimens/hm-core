const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');
const HNApp = require('@odinternational/od-havana-conn');

class VNLord extends ODInstance {
    constructor(lord_token, lord_id) {
        super('vn_lord', 'lord_token', lord_token, lord_id);
    }

    static async findLordWithInfo(username) {
        if (!username) func.throwErrorWithMissingParam('username');
        try {
            const query = `
                SELECT id as lord_id, lord_token
                FROM vn_lord
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

    async registerLord(lord_info = {}, realm_id) {
        if (!lord_info) func.throwErrorWithMissingParam('lord_info');


        const {name, cell, email, username, img_path} = lord_info;

        if (!name) func.throwErrorWithMissingParam('name');
        if (!cell) func.throwErrorWithMissingParam('cell');
        if (!email) func.throwErrorWithMissingParam('email');
        if (!username) func.throwErrorWithMissingParam('username');


        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const lordApp = new HNApp(process.env.LORD_APP_TOKEN, process.env.LORD_APP_KEY);

            const {is_exist} = await lordApp.checkUsernameExist(username);
            if (is_exist) func.throwError('USERNAME HAS BEEN TAKEN', 402);


            let avatar = img_path;
            if (!img_path) {
                const {image_path} = await lordApp.findRandomImageWithService('avatar');
                avatar = image_path;
            }
            const name_parts = name.split(' ');
            const first_name = name_parts[0], last_name = name_parts.pop();

            const {instance_token: lord_key} = await lordApp.signupUserInstance(
                username, username, email, first_name, last_name, cell
            );

            this.instance_id = await this.insertInstance({
                name,
                cell,
                email,
                username,
                lord_key,
                cdate: 'now()',
                udate: 'now()',
                realm_id,
                img_path: avatar,
                status: 1
            });

            this.instance_token = `LORD-${func.encodeUnify(this.instance_id, 'kg')}`;

            await this.updateInstance({lord_token: this.instance_token, username, status: 2});

            return {lord_id: this.instance_id, lord_token: this.instance_token, username, name};
        } catch (err) {
            throw err;
        }
    }

    static async findLordTokenWithKey(lord_key) {
        if (!lord_key) func.throwErrorWithMissingParam('lord_key');

        try {
            const query = `
                SELECT lord_token
                FROM vn_lord
                WHERE lord_key = '${lord_key}'
                LIMIT 0,1
            `;

            const [record] = await VNLord.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }

    static async findLordListInSystem(search_query = {}) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys('vn_lord', ['name', 'cell', 'email', 'username', 'img_path', 'lord_token'])
                .configComplexConditionKey('vn_realm', 'company_name')
                .configComplexConditionJoin('vn_lord', 'realm_id', 'vn_realm')
                .configComplexConditionKey('vn_lord_status', 'name', 'status_str')
                .configStatusCondition(status, 'vn_lord')
                .configStatusJoin('vn_lord', 'vn_lord_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_lord')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_lord')
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_lord')
                .configQueryLimit(start, 30)
                .configKeywordCondition(['company_name', 'company_title'], keywords, 'vn_realm');

            const count = await this.findCountOfInstance('vn_lord', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_lord', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length}

        } catch (e) {
            throw e;
        }

    }

    static async findLordListInRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys('vn_lord', ['name', 'cell', 'email', 'username', 'img_path', 'lord_token'])
                .configComplexConditionKey('vn_lord_status', 'name', 'status_str')
                .configStatusJoin('vn_lord', 'vn_lord_status')
                .configStatusCondition(status, 'vn_lord')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_lord')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_lord')
                .configComplexConditionQueryItem('vn_lord', 'realm_id', realm_id)
                .configQueryLimit(start, 30)
                .configKeywordCondition(['name', 'cell', 'email', 'username'], keywords, 'vn_lord');

            const count = await this.findCountOfInstance('vn_lord', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_lord', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNLord;