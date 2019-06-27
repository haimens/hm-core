const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNQuote extends ODInstance {

    constructor(quote_token, quote_id) {
        super('vn_quote', 'quote_token', quote_token, quote_id);
    }

    async registerQuote(amount, realm_id, car_type_id, from_address_id, to_address_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!car_type_id) func.throwErrorWithMissingParam('car_type_id');
        if (!amount) func.throwErrorWithMissingParam('amount');
        if (!from_address_id) func.throwErrorWithMissingParam('from_address_id');
        if (!to_address_id) func.throwErrorWithMissingParam('to_address_id');

        try {

            this.instance_id = await this.insertInstance(
                {
                    realm_id, car_type_id, amount,
                    from_address_id, to_address_id,
                    cdate: 'now()', udate: 'now()',
                    status: 0
                }
            );

            this.instance_token = `QUT-${func.encodeUnify(this.instance_id, 'qut')}`;

            await this.updateInstance({quote_token: this.instance_token, status: 1});

            return {quote_token: this.instance_token, quote_id: this.instance_id};

        } catch (e) {
            throw e;
        }
    }

    static givePriceQuote(price_base, price_mile, price_minute, distance, duration, car_type_prefix) {

        const base = parseInt(price_base);
        const mile_fee = Number(price_mile) * 0.000621371192 * Number(distance);
        const time_fee = Number(price_minute) * Number(duration) / 60;
        const car_prefix = parseInt(car_type_prefix);

        return Math.ceil(base + mile_fee + time_fee + car_prefix);
    }


}

module.exports = VNQuote;