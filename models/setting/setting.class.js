const ODInstance = require('../instance.model');

const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNSetting extends ODInstance {

    constructor(setting_token, setting_id) {
        super('vn_setting', 'setting_token', setting_token, setting_id);
    }


    async registerSetting(key, value, realm_id) {
        if (!key) func.throwErrorWithMissingParam('key');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!value) func.throwErrorWithMissingParam('value');

        try {

            this.key = key;

            if (await this._findKeyExist(realm_id)) {
                await this._updateValueWithKey(realm_id, value);
                return await this._findTokenInfoWithKey(realm_id);
            }

            this.instance_id = await this.insertInstance(
                {key, value, realm_id, cdate: 'now()', udate: 'now()', status: 0}
            );

            this.instance_token = `SETT-${func.encodeUnify(this.instance_id, 'sett')}`;

            await this.updateInstance({setting_token: this.instance_token, status: 1});

            return {setting_token: this.instance_token, setting_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }


    async _findKeyExist(realm_id) {
        if (!this.key) func.throwErrorWithMissingParam('key');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const query = `
                SELECT COUNT(id) AS count 
                FROM vn_setting 
                WHERE vn_setting.key = '${this.key}' 
                AND vn_setting.realm_id = ${realm_id}
            `;

            const [{count}] = await VNSetting.performQuery(query);

            return !(count === 0);
        } catch (e) {
            throw e;
        }
    }

    async _updateValueWithKey(realm_id, value) {
        if (!this.key) func.throwErrorWithMissingParam('key');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!value) func.throwErrorWithMissingParam('value');
        try {

            const query = `
                UPDATE vn_setting SET value = ${value}, status = 1
                WHERE vn_setting.key = '${this.key}'
                AND vn_setting.realm_id = ${realm_id}
            `;

            return await VNSetting.performQuery(query);
        } catch (e) {
            throw e;
        }
    }

    async _findTokenInfoWithKey(realm_id) {
        if (!this.key) func.throwErrorWithMissingParam('key');
        try {
            const query = `
                SELECT setting_token, id AS setting_id 
                FROM vn_setting 
                WHERE vn_setting.key = '${this.key}' 
                AND vn_setting.realm_id = ${realm_id} 
                AND vn_setting.status = 1 
                LIMIT 0, 1
            `;

            const [record] = await VNSetting.performQuery(query);


            return record;
        } catch (e) {
            throw e;
        }
    }


    static async findSettingListInRealm(realm_id, search_query) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions.configComplexConditionKeys('vn_setting', ['key', 'value', 'cdate', 'udate', 'setting_token', 'status'])
                .configComplexConditionQueryItem('vn_setting', 'realm_id', realm_id)
                .configStatusCondition(status, 'vn_setting')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_setting')
                .configKeywordCondition(['key', 'value'], keywords, 'vn_setting')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_setting')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_setting', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_setting', conditions);

            return {
                record_list, count, end: (parseInt(start) || 0) + record_list.length
            }
        } catch (e) {
            throw e;
        }
    }

    static async findSettingInfoWithKey(realm_id, key) {
        try {
            if (!realm_id) func.throwErrorWithMissingParam('realm_id');
            if (!key) func.throwErrorWithMissingParam('key');

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_setting', ['key', 'value'])
                .configComplexConditionQueryItem('vn_setting', 'key', key)
                .configStatusCondition(1, 'vn_setting')
                .configComplexConditionQueryItem('vn_setting', 'realm_id', realm_id)
                .configQueryLimit(0, 1);

            const [record] = await VNSetting.findInstanceListWithComplexCondition('vn_setting', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNSetting;