const func = require('od-utility');
const ODInstance = require('../instance.model');


class VNAddress extends ODInstance {

    constructor(address_token, address_id) {
        super('vn_address', 'address_token', address_token, address_id);
    }

    async registerAddress(address_info = {}) {

        const {street_line_1, street_line_2, city, state, zip, addr_str, lat, lng} = address_info;

        try {
            if (!street_line_1) func.throwErrorWithMissingParam('street_line_1');

            if (!city) func.throwErrorWithMissingParam('city');
            if (!state) func.throwErrorWithMissingParam('state');
            if (!zip) func.throwErrorWithMissingParam('zip');
            if (!addr_str) func.throwErrorWithMissingParam('addr_str');
            if (!lat) func.throwErrorWithMissingParam('lat');
            if (!lng) func.throwErrorWithMissingParam('lng');

            let address_str = addr_str;
            if (!address_str) address_str = `${street_line_1} ${street_line_2 || ''}, ${city}, ${state}, ${zip}`;

            const addr_record = await VNAddress._findAddressWithAddressStr(address_str);

            if (addr_record) return addr_record;

            this.instance_id = await this.insertInstance(
                {
                    addr_str: address_str, street_line_1,
                    street_line_2: street_line_2 || '',
                    city, state: state, zip, cdate: 'now()', udate: 'now()', status: 0,
                    lat, lng
                });
            this.instance_token = `ADDR-${func.encodeUnify(this.instance_id, 'addr')}`;

            await this.updateInstance({address_token: this.instance_token, status: 1});

            return {address_token: this.instance_token, address_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async _findAddressWithAddressStr(addr_str) {
        try {
            if (!addr_str) func.throwErrorWithMissingParam('addr_str');

            const query = `
                SELECT id AS address_id, address_token 
                FROM vn_address 
                WHERE addr_str = '${addr_str}' 
                AND status = 1 
            `;

            const [record] = await this.performQuery(query);

            if (!record) return null;

            return record;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNAddress;