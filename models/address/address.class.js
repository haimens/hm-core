const func = require('od-utility');
const ODInstance = require('../instance.model');


class VNAddress extends ODInstance {

    constructor(address_token, address_id) {
        super('vn_address', 'address_token', address_token, address_id);
    }

    async registerAddress(address_info = {}) {
        const {street_line_1, street_line_2, city, state, zip} = address_info;

        try {
            if (!street_line_1) func.throwErrorWithMissingParam('street_line_1');

            if (!city) func.throwErrorWithMissingParam('city');
            if (!state) func.throwErrorWithMissingParam('state');
            if (!zip) func.throwErrorWithMissingParam('zip');

            const addr_str = `${street_line_1} ${street_line_2 || ''}, ${city}, ${state}, ${zip}`;

            //TODO: lat, lng HERE


            this.instance_id = await this.insertInstance(
                {
                    addr_str, street_line_1,
                    street_line_2: street_line_2 || '',
                    city, state, zip, cdate: 'now()', udate: 'now()', status: 0
                });

            this.instance_token = `ADDR-${func.encodeUnify(this.instance_id, 'addr')}`;

            await this.updateInstance({address_token: this.instance_token, status: 1});

            return {address_token: this.instance_token, address_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNAddress;