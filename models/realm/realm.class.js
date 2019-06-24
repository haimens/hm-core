const ODInstance = require('../instance.model');
const func = require('od-utility');

class VNRealm extends ODInstance {

    constructor(realm_token, realm_id) {
        super('vn_realm', 'realm_token', realm_token, realm_id);
    }

    async registerRealm(realm_info = {}, tribute_id, address_id) {


        try {
            if (!realm_info) func.throwErrorWithMissingParam('realm_info');

            const {company_name, logo_path, icon_path, company_title} = realm_info;

            if (!company_name) func.throwErrorWithMissingParam('company_name');
            if (!logo_path) func.throwErrorWithMissingParam('logo_path');
            if (!icon_path) func.throwErrorWithMissingParam('icon_path');
            if (!company_title) func.throwErrorWithMissingParam('company_title');


            if (!tribute_id) func.throwErrorWithMissingParam('tribute_id');
            if (!address_id) func.throwErrorWithMissingParam('address_id');

            const title_count = VNRealm._findRealmTitleCountWithTitle(company_title);

            if (title_count !== 0) func.throwError('COMPANY TITLE OCCUPIED', 400);

            this.instance_id = await this.insertInstance({
                cdate: 'now()', udate: 'now()',
                company_name, logo_path, icon_path,
                company_title,
                tribute_id, address_id,
                status: 1
            });

            const realm_token = `REALM-${ func.encodeUnify(this.instance_id, 'realm')}`;
            await this.updateInstance({realm_token, status: 2});

            return {realm_id: this.instance_id, realm_token};

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