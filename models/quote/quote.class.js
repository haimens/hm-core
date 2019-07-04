const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');


class VNQuote extends ODInstance {

    constructor(quote_token, quote_id) {
        super('vn_quote', 'quote_token', quote_token, quote_id);
    }

    async registerQuote(amount, realm_id, car_type_id, from_address_id, to_address_id, pickup_time, pickup_time_local) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!car_type_id) func.throwErrorWithMissingParam('car_type_id');
        if (!amount) func.throwErrorWithMissingParam('amount');
        if (!from_address_id) func.throwErrorWithMissingParam('from_address_id');
        if (!to_address_id) func.throwErrorWithMissingParam('to_address_id');
        if (!pickup_time_local) func.throwErrorWithMissingParam('pickup_time_local');

        try {

            this.instance_id = await this.insertInstance(
                {
                    realm_id, car_type_id, amount,
                    from_address_id, to_address_id,
                    pickup_time, pickup_time_local,
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

    async findFullQuoteWithToken(realm_id) {
        if (!this.instance_token) func.throwErrorWithMissingParam('quote_token');

        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_quote', ['from_address_id', 'to_address_id',
                    'pickup_time', 'pickup_time_local', 'amount'])
                .configComplexConditionKey('vn_car_type', 'name', 'vehicle_type')
                .configComplexConditionJoin('vn_quote', 'car_type_id', 'vn_car_type')
                .configComplexConditionQueryItem('vn_quote', 'realm_id', realm_id)
                .configStatusCondition(1, 'vn_quote')
                .configComplexConditionQueryItem('vn_quote', 'quote_token', this.instance_token)
                .configQueryLimit(0, 1);

            const [record] = await VNQuote.findInstanceListWithComplexCondition('vn_quote', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNQuote;