const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');


const func = require('od-utility');


class VNAlert extends ODInstance {

    constructor(alert_token, alert_id) {
        super('vn_alert', 'alert_token', alert_token, alert_id);
    }

    async registerAlert(info = {}, order_id, customer_id, trip_id, realm_id) {

        const {record_time, type} = info;

        if (!record_time) func.throwErrorWithMissingParam('record_time');
        if (!type) func.throwErrorWithMissingParam('type');
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!trip_id) func.throwErrorWithMissingParam('trip_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!customer_id) func.throwErrorWithMissingParam('customer_id');


        try {
            this.instance_id = await this.insertInstance(
                {
                    record_time, type, order_id, trip_id, realm_id,
                    customer_id,
                    cdate: 'now()', udate: 'now()', status: 1
                }
            );

            this.instance_token = `ALTR-${func.encodeUnify(this.instance_id, 'altr')}`;

            await this.updateInstance({alert_token: this.instance_token, status: 2});

            return {alert_token: this.instance_token, alert_id: this.alert_id};
        } catch (e) {
            throw e;
        }
    }

    static async findAlertInSystem() {
        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_alert', ['id AS alert_id', 'record_time', 'status', 'type', 'cdate', 'udate', 'alert_token', 'realm_id'])
                .configComplexConditionKeys('vn_realm', ['realm_token'])
                .configComplexConditionKeys('vn_message_resource', ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num'])
                .configComplexConditionKey('vn_alert_type', 'name', 'type_str')
                .configComplexConditionKeys('vn_trip', ['trip_token'])
                .configComplexConditionKeys('vn_driver', ['name AS driver_name', 'cell AS driver_cell'])
                .configComplexConditionKeys('vn_customer', ['name AS customer_name', 'cell AS customer_cell'])
                .configComplexConditionJoins(
                    'vn_alert',
                    [
                        {key: 'realm_id', tar: 'vn_realm'},
                        {key: 'trip_id', tar: 'vn_trip'},
                        {key: 'type', tar: 'vn_alert_type'}

                    ]
                )
                .configComplexConditionJoins(
                    'vn_trip',
                    [
                        {key: 'driver_id', tar: 'vn_driver'},
                        {key: 'customer_id', tar: 'vn_customer'}
                    ]
                )
                .configComplexConditionJoin('vn_realm', 'primary_message_resource_id', 'vn_message_resource')
                .configComplexConditionQueryItem('vn_alert', 'status', 2)
                .configComplexConditionQueryItem('vn_realm', 'status', 2)
                .configSimpleCondition(`vn_alert.record_time < now()`)
                .configSimpleCondition(`
                    IF(vn_alert.type = 1, 
                        vn_trip.start_time IS NULL,
                        IF(vn_alert.type = 2, 
                            vn_trip.arrive_time IS NULL, 
                            IF(vn_alert.type = 3, 
                                vn_trip.cob_time IS NULL,
                                    false)))   `)
                .configQueryLimit(0, 200);


            const record_list = await this.findInstanceListWithComplexCondition('vn_alert', conditions);

            return {record_list};

        } catch (e) {
            throw e;
        }
    }

    static async findAlertListInRealm(search_query = {}, realm_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_alert', ['record_time', 'status', 'type', 'cdate', 'udate', 'alert_token'])
                .configComplexConditionKeys('vn_order', ['order_token', 'contact_name', 'contact_cell'])
                .configComplexConditionKeys('vn_driver',
                    [
                        'driver_token',
                        'name AS driver_name',
                        'img_path AS driver_img_path', 'cell AS driver_cell',
                        'email AS driver_email'
                    ])
                .configComplexConditionKeys('vn_customer',
                    [
                        'customer_token',
                        'name AS customer_name',
                        'img_path AS customer_img_path', 'cell AS customer_cell',
                        'email AS customer_email'
                    ])
                .configComplexConditionKey('vn_alert_type', 'name', 'type_str')
                .configComplexConditionKey('vn_alert_status', 'name', 'status_str')
                .configComplexConditionKey('vn_trip', 'trip_token')
                .configComplexConditionJoins('vn_alert',
                    [
                        {key: 'order_id', tar: 'vn_order'},
                        {key: 'trip_id', tar: 'vn_trip'},
                        {key: 'type', tar: 'vn_alert_type'},
                        {key: 'status', tar: 'vn_alert_status'}
                    ]
                )
                .configComplexConditionJoins('vn_trip', [
                        {key: 'customer_id', tar: 'vn_customer'},
                        {key: 'driver_id', tar: 'vn_driver'}
                    ]
                )
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_alert')
                .configStatusCondition(status, 'vn_alert')
                .configComplexConditionQueryItem('vn_alert', 'realm_id', realm_id)
                .configKeywordCondition(['name', 'cell', 'email'], keywords, 'vn_driver')
                .configKeywordCondition(['name', 'cell', 'email'], keywords, 'vn_customer')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate', 'record_time'], 'vn_alert')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_alert', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_alert', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findAlertListWithDriver(search_query = {}, realm_id, driver_id) {
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_alert', ['record_time', 'status', 'type', 'cdate', 'udate', 'alert_token'])
                .configComplexConditionKeys('vn_order', ['order_token', 'contact_name', 'contact_cell'])
                .configComplexConditionKeys('vn_driver',
                    [
                        'driver_token',
                        'name AS driver_name',
                        'img_path AS driver_img_path', 'cell AS driver_cell',
                        'email AS driver_email'
                    ])
                .configComplexConditionKeys('vn_customer',
                    [
                        'customer_token',
                        'name AS customer_name',
                        'img_path AS customer_img_path', 'cell AS customer_cell',
                        'email AS customer_email'
                    ])
                .configComplexConditionKey('vn_alert_type', 'name', 'type_str')
                .configComplexConditionKey('vn_alert_status', 'name', 'status_str')
                .configComplexConditionKey('vn_trip', 'trip_token')
                .configComplexConditionJoin('vn_alert', 'order_id', 'vn_order')
                .configComplexConditionJoin('vn_alert', 'trip_id', 'vn_trip')
                .configComplexConditionJoin('vn_alert', 'type', 'vn_alert_type')
                .configComplexConditionJoin('vn_alert', 'status', 'vn_alert_status')
                .configComplexConditionJoin('vn_trip', 'driver_id', 'vn_driver')
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_alert')
                .configStatusCondition(status, 'vn_alert')
                .configComplexConditionQueryItem('vn_alert', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_trip', 'driver_id', driver_id)
                .configKeywordCondition(['name', 'cell', 'email'], keywords, 'vn_driver')
                .configKeywordCondition(['name', 'cell', 'email'], keywords, 'vn_customer')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate', 'record_time'], 'vn_alert')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_alert', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_alert', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findAlertListInTrip(trip_id, realm_id) {
        try {


            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_alert', ['record_time', 'status', 'type', 'cdate', 'udate', 'alert_token'])
                .configComplexConditionKey('vn_alert_type', 'name', 'type_str')
                .configComplexConditionKey('vn_alert_status', 'name', 'status_str')
                .configComplexConditionJoin('vn_alert', 'type', 'vn_alert_type')
                .configComplexConditionJoin('vn_alert', 'status', 'vn_alert_status')
                .configStatusCondition('all', 'vn_alert')
                .configComplexConditionQueryItem('vn_alert', 'realm_id', realm_id)
                .configComplexConditionQueryItem('vn_alert', 'trip_id', trip_id)
                .configQueryLimit(0, 10);

            const record_list = await this.findInstanceListWithComplexCondition('vn_alert', conditions);
            return {record_list};

        } catch (e) {
            throw e;
        }
    }

    static async checkTripAlerts(trip_id, realm_id) {
        if (!trip_id) func.throwErrorWithMissingParam('trip_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const query = `SELECT COUNT(vn_alert.id) AS count 
                FROM vn_alert 
                WHERE vn_alert.trip_id = ${trip_id}
                AND vn_alert.status > 0 
                AND vn_alert.realm_id = ${realm_id} 
                LIMIT 0, 1
            `;

            const [{count}] = await this.performQuery(query);

            return parseInt(count) || 0;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNAlert;