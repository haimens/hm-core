const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');

class VNRealm extends ODInstance {

    constructor(realm_token, realm_id) {
        super('vn_realm', 'realm_token', realm_token, realm_id);
    }

    async registerRealm(realm_info = {}, tribute_rate_id, address_id) {


        try {
            if (!realm_info) func.throwErrorWithMissingParam('realm_info');

            const {company_name, logo_path, icon_path, company_title} = realm_info;

            if (!company_name) func.throwErrorWithMissingParam('company_name');
            if (!logo_path) func.throwErrorWithMissingParam('logo_path');
            if (!icon_path) func.throwErrorWithMissingParam('icon_path');
            if (!company_title) func.throwErrorWithMissingParam('company_title');


            if (!tribute_rate_id) func.throwErrorWithMissingParam('tribute_id');
            if (!address_id) func.throwErrorWithMissingParam('address_id');

            const title_count = await VNRealm._findRealmTitleCountWithTitle(company_title);

            if (title_count !== 0) func.throwError('COMPANY TITLE OCCUPIED', 400);

            this.instance_id = await this.insertInstance({
                cdate: 'now()', udate: 'now()',
                company_name, logo_path, icon_path,
                company_title,
                tribute_rate_id, address_id,
                status: 1
            });

            const realm_token = `REALM-${ func.encodeUnify(this.instance_id, 'realm')}`;
            await this.updateInstance({realm_token, status: 2});

            return {realm_id: this.instance_id, realm_token};

        } catch (e) {
            throw e;
        }
    }


    static async findRealmListInSystem(search_query) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_realm',
                    ['company_name', 'company_title', 'cdate', 'udate', 'logo_path', 'icon_path']
                )
                .configComplexConditionKeys('vn_tribute_rate', ['rate', 'tribute_rate_token'])
                .configComplexConditionKeys('vn_address', ['addr_str', 'lat', 'lng', 'address_token'])
                .configComplexConditionKey('vn_realm_status', 'name', 'status_str')
                .configComplexConditionJoins(
                    'vn_realm',
                    [{key: 'address_id', tar: 'vn_address'}, {key: 'tribute_rate_id', tar: 'vn_tribute_rate'}]
                )
                .configStatusCondition(status, 'vn_realm')
                .configStatusJoin('vn_realm', 'vn_realm_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_realm')
                .configKeywordCondition(['company_name', 'company_title'], keywords, 'vn_realm')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_realm')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_realm', conditions);
            if (count === 0) return {record_list: [], count, end: 0};


            const record_list = await this.findInstanceListWithComplexCondition(
                'vn_realm', conditions
            );

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }


    static async _findRealmTitleCountWithTitle(title) {
        try {
            if (!title) return 0;

            const query = `
            SELECT COUNT(id) AS count 
            FROM vn_realm 
            WHERE company_title = '${title}' 
            AND status != 0 `;

            const [{count}] = await this.performQuery(query);


            return count || 0;

        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNRealm;