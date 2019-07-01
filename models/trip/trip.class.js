const func = require('od-utility');

const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');


class VNTrip extends ODInstance {


    constructor(trip_token, trip_id) {
        super('vn_trip', 'trip_token', trip_token, trip_id);
    }


    async registerTrip(info = {}, customer_id, order_id, realm_id) {


        const {pickup_time, from_address_id, to_address_id,}

        try {


        } catch (e) {
            throw e;
        }
    }


    async findFullTripInfo() {
        try {
            if (!this.instance_id) {
                if (!this.instance_token) func.throwErrorWithMissingParam('trip_token');
                const {vn_trip_id: trip_id} = await this.findInstanceDetailWithToken();
                this.instance_id = trip_id;
            }

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_trip',
                    [
                        'trip_token', 'cdate', 'udate',
                        'driver_id', 'car_id', 'customer_id', 'from_address_id', 'to_address_id', 'order_id',
                        'realm_id', 'pickup_time', 'start_time', 'eta_time', 'cob_time', 'arrive_time',
                        'flight_id', 'amount', 'flight_str', 'cad_time',
                        'is_paid', 'note', 'vehicle_type', 'status'
                    ]
                )
                .configComplexConditionKeys(
                    'vn_order',
                    ['order_token', 'contact_name', 'contact_cell', 'type']
                )
                .configComplexConditionJoin(
                    'vn_trip', 'status', 'vn_trip_status'
                )
                .configComplexConditionJoin(
                    'vn_trip', 'order_id', 'vn_order'
                )
                .configComplexConditionKey(
                    'vn_trip_status',
                    'name', 'status_str'
                )
                .configComplexConditionQueryItem(
                    'vn_trip', 'id', trip_id
                );

            const [record] = await VNTrip.findInstanceListWithComplexCondition('vn_trip', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }
}


module.exports = VNTrip;