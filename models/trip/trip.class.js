const func = require('od-utility');

const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');


class VNTrip extends ODInstance {


    constructor(trip_token, trip_id) {
        super('vn_trip', 'trip_token', trip_token, trip_id);
    }


    async registerTrip(info = {}, customer_id, order_id, realm_id) {

        const {pickup_time, pickup_time_local, from_address_id, to_address_id, vehicle_type, amount, flight_str} = info;

        if (!pickup_time) func.throwErrorWithMissingParam('pickup_time');
        if (!pickup_time_local) func.throwErrorWithMissingParam('pickup_time_local');
        if (!from_address_id) func.throwErrorWithMissingParam('from_address_id');
        if (!to_address_id) func.throwErrorWithMissingParam('to_address_id');

        if (!amount) func.throwErrorWithMissingParam('amount');

        if (!customer_id) func.throwErrorWithMissingParam('customer_id');
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');


        try {
            this.instance_id = await this.insertInstance(
                {
                    pickup_time, pickup_time_local, from_address_id, to_address_id,
                    vehicle_type, flight_str,
                    customer_id, order_id, realm_id,
                    amount,
                    cdate: 'now()', udate: 'now()',
                    status: 0
                }
            );

            this.instance_token = `TRIP-${func.encodeUnify(this.instance_id, 'trip')}`;
            await this.updateInstance({trip_token: this.instance_token, status: 1});


            return {trip_token: this.instance_token, trip_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }


    async findFullTripInfo(realm_id) {
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
                        'id AS trip_id',
                        'trip_token', 'cdate', 'udate',
                        'driver_id', 'car_id', 'customer_id', 'from_address_id', 'to_address_id',
                        'realm_id', 'pickup_time', 'pickup_time_local', 'start_time', 'eta_time', 'cob_time', 'arrive_time',
                        'flight_id', 'amount', 'flight_str', 'cad_time', 'is_paid',
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
                .configComplexConditionKey('vn_order_type', 'name', 'type_str')
                .configComplexConditionJoin('vn_order', 'type', 'vn_order_type')
                .configComplexConditionQueryItem(
                    'vn_trip', 'id', this.instance_id
                )
                .configComplexConditionQueryItem(
                    'vn_trip', 'realm_id', realm_id
                )
            ;

            const [record] = await VNTrip.findInstanceListWithComplexCondition('vn_trip', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }


    static async findTripListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    ['order_token', 'contact_name', 'contact_cell', 'type']
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    ['customer_token', 'name AS customer_name', 'cell AS customer_cell', 'email AS customer_email']
                )
                .configComplexConditionKeys(
                    'trip_info',
                    [
                        'trip_token', 'cdate', 'udate', 'pickup_time',
                        'start_time', 'eta_time', 'cob_time', 'cad_time', 'arrive_time',
                        'flight_str', 'status'
                    ]
                )
                .configComplexConditionKeys(
                    'vn_driver',
                    [
                        'name AS driver_name', 'cell AS driver_cell',
                        'img_path AS driver_img_path', 'email AS driver_email',
                        'driver_token'
                    ]
                )
                .configComplexConditionKeys('from_addr', ['lat AS from_lat', 'lng AS from_lng', 'addr_str AS from_addr_str'])
                .configComplexConditionKeys('to_addr', ['lat AS to_lat', 'lng AS to_lng', 'addr_str AS to_addr_str'])
                .configComplexConditionKey('vn_trip_status', 'name', 'status_str')
                .configComplexConditionJoin('trip_info', 'order_id', 'vn_order')
                .configComplexConditionJoin('trip_info', 'customer_id', 'vn_customer')
                .configComplexConditionJoin('trip_info', 'driver_id', 'vn_driver')
                .configSimpleJoin('LEFT JOIN vn_address AS from_addr ON trip_info.from_address_id = from_addr.id ')
                .configSimpleJoin('LEFT JOIN vn_address AS to_addr ON trip_info.to_address_id = to_addr.id ')
                .configStatusJoin('trip_info', 'vn_trip_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'trip_info')
                .configKeywordCondition(['contact_name', 'contact_cell'], keywords, 'vn_order')
                .configStatusCondition(status, 'trip_info')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'trip_info')
                .configComplexConditionQueryItem('trip_info', 'realm_id', realm_id)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_trip', conditions, 'trip_info');

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip AS trip_info', conditions);


            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }

    static async findActiveTripListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction} = search_query;

            const conditions = new ODCondition();

            // console.log('search_query', search_query);

            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    ['order_token', 'contact_name', 'contact_cell', 'type']
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    ['customer_token', 'name AS customer_name', 'cell AS customer_cell', 'email AS customer_email']
                )
                .configComplexConditionKeys(
                    'trip_info',
                    [
                        'trip_token', 'cdate', 'udate', 'pickup_time',
                        'start_time', 'eta_time', 'cob_time', 'cad_time', 'arrive_time',
                        'flight_str', 'status'
                    ]
                )
                .configComplexConditionKeys(
                    'vn_driver',
                    [
                        'name AS driver_name', 'cell AS driver_cell',
                        'img_path AS driver_img_path', 'email AS driver_email',
                        'driver_token'
                    ]
                )
                .configComplexConditionKeys('from_addr', ['lat AS from_lat', 'lng AS from_lng', 'addr_str AS from_addr_str'])
                .configComplexConditionKeys('to_addr', ['lat AS to_lat', 'lng AS to_lng', 'addr_str AS to_addr_str'])
                .configComplexConditionKey('vn_trip_status', 'name', 'status_str')
                .configComplexConditionJoin('trip_info', 'order_id', 'vn_order')
                .configComplexConditionJoin('trip_info', 'customer_id', 'vn_customer')
                .configComplexConditionJoin('trip_info', 'driver_id', 'vn_driver')
                .configSimpleJoin('LEFT JOIN vn_address AS from_addr ON trip_info.from_address_id = from_addr.id ')
                .configSimpleJoin('LEFT JOIN vn_address AS to_addr ON trip_info.to_address_id = to_addr.id ')
                .configStatusJoin('trip_info', 'vn_trip_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'trip_info')
                .configKeywordCondition(['contact_name', 'contact_cell'], keywords, 'vn_order')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'trip_info')
                .configComplexConditionQueryItem('trip_info', 'realm_id', realm_id)
                .configSimpleCondition(
                    '(trip_info.status = 3 OR trip_info.status = 4 OR trip_info.status = 5 OR trip_info.status = 6)'
                )
                .configQueryLimit(start, 30);

            // console.log(conditions.printRecordQuery('vn_trip AS trip_info'));


            const count = await this.findCountOfInstance('vn_trip', conditions, 'trip_info');

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip AS trip_info', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};

        } catch (e) {
            throw e;
        }
    }


    static async findTripListInOrder(realm_id, order_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {

            // const conditions = new ODCondition();

            const query = `
            SELECT vn_order.order_token, 
            vn_order.contact_name, 
            vn_order.contact_cell, 
            vn_order.type, 
            trip_info.trip_token, 
            trip_info.amount, 
            trip_info.cdate, 
            trip_info.udate, 
            trip_info.pickup_time, 
            trip_info.pickup_time_local, 
            trip_info.start_time, 
            trip_info.eta_time, 
            trip_info.cob_time, 
            trip_info.cad_time, 
            trip_info.arrive_time, 
            trip_info.flight_str, 
            trip_info.is_paid, 
            trip_info.status, 
            from_addr_info.addr_str AS from_addr_str, 
            from_addr_info.lat AS from_lat, 
            from_addr_info.lng AS from_lng, 
            to_addr_info.addr_str AS to_addr_str, 
            to_addr_info.lat AS to_lat, 
            to_addr_info.lng AS to_lng, 
            vn_trip_status.name AS status_str 
            FROM vn_trip AS trip_info
            LEFT JOIN vn_address AS from_addr_info ON from_addr_info.id = trip_info.from_address_id 
            LEFT JOIN vn_address AS to_addr_info ON to_addr_info.id = trip_info.to_address_id 
            LEFT JOIN vn_order ON vn_order.id = trip_info.order_id  
            LEFT JOIN vn_trip_status ON vn_trip_status.id = trip_info.status 
            WHERE trip_info.status != 0 
            AND trip_info.order_id = ${order_id}
            AND trip_info.realm_id = ${realm_id} 
             
             
            LIMIT 0, 10
`;
            const record_list = await this.performQuery(query);

            return {record_list};

        } catch (e) {
            throw e;
        }
    }

    static async findTripListWithDriver(search_query = {}, realm_id, driver_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    ['order_token', 'contact_name', 'contact_cell', 'type']
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    ['customer_token', 'name AS customer_name', 'cell AS customer_cell', 'email AS customer_email']
                )
                .configComplexConditionKeys(
                    'trip_info',
                    [
                        'trip_token', 'cdate', 'udate', 'pickup_time',
                        'start_time', 'eta_time', 'cob_time', 'cad_time', 'arrive_time',
                        'flight_str', 'status'
                    ]
                )
                .configComplexConditionKeys('from_addr', ['lat AS from_lat', 'lng AS from_lng', 'addr_str AS from_addr_str'])
                .configComplexConditionKeys('to_addr', ['lat AS to_lat', 'lng AS to_lng', 'addr_str AS to_addr_str'])
                .configComplexConditionKey('vn_trip_status', 'name', 'status_str')
                .configComplexConditionJoin('trip_info', 'order_id', 'vn_order')
                .configComplexConditionJoin('trip_info', 'customer_id', 'vn_customer')
                .configSimpleJoin('LEFT JOIN vn_address AS from_addr ON trip_info.from_address_id = from_addr.id ')
                .configSimpleJoin('LEFT JOIN vn_address AS to_addr ON trip_info.to_address_id = to_addr.id ')
                .configStatusJoin('trip_info', 'vn_trip_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'trip_info')
                .configKeywordCondition(['contact_name', 'contact_cell'], keywords, 'vn_order')
                .configStatusCondition(status, 'trip_info')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'trip_info')
                .configComplexConditionQueryItem('trip_info', 'realm_id', realm_id)
                .configComplexConditionQueryItem('trip_info', 'driver_id', driver_id)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_trip', conditions, 'trip_info');

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip AS trip_info', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }


    static async findActiveTripListWithDriver(search_query = {}, realm_id, driver_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');

        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction} = search_query;

            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys(
                    'vn_order',
                    ['order_token', 'contact_name', 'contact_cell', 'type']
                )
                .configComplexConditionKeys(
                    'vn_customer',
                    ['customer_token', 'name AS customer_name', 'cell AS customer_cell', 'email AS customer_email']
                )
                .configComplexConditionKeys(
                    'trip_info',
                    [
                        'trip_token', 'cdate', 'udate', 'pickup_time',
                        'start_time', 'eta_time', 'cob_time', 'cad_time', 'arrive_time',
                        'flight_str', 'status'
                    ]
                )
                .configComplexConditionKeys('from_addr', ['lat AS from_lat', 'lng AS from_lng', 'addr_str AS from_addr_str'])
                .configComplexConditionKeys('to_addr', ['lat AS to_lat', 'lng AS to_lng', 'addr_str AS to_addr_str'])
                .configComplexConditionKey('vn_trip_status', 'name', 'status_str')
                .configComplexConditionJoin('trip_info', 'order_id', 'vn_order')
                .configComplexConditionJoin('trip_info', 'customer_id', 'vn_customer')
                .configSimpleJoin('LEFT JOIN vn_address AS from_addr ON trip_info.from_address_id = from_addr.id ')
                .configSimpleJoin('LEFT JOIN vn_address AS to_addr ON trip_info.to_address_id = to_addr.id ')
                .configStatusJoin('trip_info', 'vn_trip_status')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'trip_info')
                .configKeywordCondition(['contact_name', 'contact_cell'], keywords, 'vn_order')
                .configSimpleCondition(
                    '(trip_info.status = 3 OR trip_info.status = 4 OR trip_info.status = 5 OR trip_info.status = 6)'
                )
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'trip_info')
                .configComplexConditionQueryItem('trip_info', 'realm_id', realm_id)
                .configComplexConditionQueryItem('trip_info', 'driver_id', driver_id)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_trip', conditions, 'trip_info');

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip AS trip_info', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }


    static async findActiveTripWithCustomer(realm_id, customer_id) {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKey('vn_trip', 'trip_token')
                .configComplexConditionKey('vn_driver', 'player_key', 'driver_token')
                .configSimpleCondition(
                    '(vn_trip.status = 3 OR vn_trip.status = 4 OR vn_trip.status = 5 OR vn_trip.status = 6)'
                )
                .configComplexConditionJoin('vn_trip', 'driver_id', 'vn_driver')
                .configComplexConditionQueryItem('vn_trip', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_trip', 'customer_id', customer_id)

                .configComplexOrder('udate', 'DESC', ['udate'], 'vn_trip')
                .configQueryLimit(0, 5);

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip', conditions);


            return {record_list};
        } catch (e) {
            throw e;
        }
    }

    static async findTripCountForMonth(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {date_from, date_to, from_key, to_key, status} = search_query;

            const conditions = new ODCondition([], [], [], '', '', 'GROUP BY DATE(vn_trip.pickup_time_local)');

            console.log('I AM HERE');
            conditions
                .configComplexSimpleKey('COUNT(vn_trip.id) AS count')
                .configComplexSimpleKey(
                    'CONCAT(YEAR(vn_trip.pickup_time_local),' - ',MONTH(vn_trip.pickup_time_local),' - ',DAY(vn_trip.pickup_time_local)) AS date')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_trip')
                .configComplexConditionQueryItem('vn_trip', 'realm_id', realm_id)
                .configSimpleGroup('DATE(vn_trip.pickup_time_local)')
                .configQueryLimit(0, 100);

            if (status === 'active') {
                conditions.configSimpleCondition('(vn_trip.status = 3 OR vn_trip.status = 4 OR vn_trip.status = 5 OR vn_trip.status = 6)')
            }

            if (status === 'finished') {
                conditions.configStatusCondition(7, 'vn_trip');
            }

            if (status === 'failed') {
                conditions.configStatusCondition(8, 'vn_trip');
            }

            console.log('query', conditions.printRecordQuery('vn_trip'));

            const record_list = await this.findInstanceListWithComplexCondition('vn_trip', conditions);

            console.log('result', record_list);
            return record_list || [];
        } catch (e) {
            throw e;
        }
    }
}


module.exports = VNTrip;