const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNFlight extends ODInstance {

    constructor(flight_token, flight_id, flight_key) {
        super('vn_flight', 'flight_token', flight_token, flight_id);
        this.flight_key = flight_key;
    }

    async registerFlight(flight_info = {}) {
        const {
            flight_key, dep_date, arr_date, carrier_code,
            flight_num, dep_airport, arr_airport, dep_terminal, arr_terminal
        } = flight_info;

        if (!flight_key) func.throwErrorWithMissingParam('flight_key');
        if (!dep_date) func.throwErrorWithMissingParam('dep_date');
        if (!arr_date) func.throwErrorWithMissingParam('arr_date');
        if (!carrier_code) func.throwErrorWithMissingParam('carrier_code');
        if (!flight_num) func.throwErrorWithMissingParam('flight_num');
        if (!dep_airport) func.throwErrorWithMissingParam('dep_airport');
        if (!arr_airport) func.throwErrorWithMissingParam('arr_airport');
        if (!dep_terminal) func.throwErrorWithMissingParam('dep_terminal');
        if (!arr_terminal) func.throwErrorWithMissingParam('arr_terminal');
        try {
            this.flight_key = flight_key;
            const pre_saved = await this.findFlightInfoWithKey();
            if (pre_saved) return pre_saved;

            this.instance_id = await


        } catch (e) {
            throw e;
        }
    }

    async findFlightInfoWithKey() {
        if (!this.flight_key) func.throwErrorWithMissingParam('flight_key');

        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_flight',
                    [
                        'flight_key', 'dep_date', 'arr_date', 'carrier_code',
                        'flight_num', 'dep_airport', 'arr_airport',
                        'dep_terminal', 'arr_terminal', 'flight_token', 'cdate', 'udate'
                    ]
                )
                .configComplexConditionQueryItem('vn_flight', 'flight_key', this.flight_key)
                .configStatusCondition(1, 'vn_flight')
                .configQueryLimit(0, 1);

            const [record] = await VNFlight.findInstanceListWithComplexCondition(
                'vn_flight', conditions
            );

            return record;
        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNFlight;