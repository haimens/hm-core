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
                .configComplexConditionJoin('vn_alert', 'order_id', 'vn_order')
                .configComplexConditionJoin('vn_alert', 'trip_id', 'vn_trip')
                .configComplexConditionJoin('vn_alert', 'type', 'vn_alert_type')
                .configComplexConditionJoin('vn_alert', 'status', 'vn_alert_status')
                .configComplexConditionJoin('vn_trip', 'driver_id', 'vn_driver')
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