const VNAction = require('../action.model');

const VNTrip = require('../../models/trip/trip.class');

const VNAddon = require('../../models/addon/addon.class');

const VNOrder = require('../../models/order/order.class');

const VNDriver = require('../../models/driver/driver.class');

const VNCar = require('../../models/car/car.class');

const VNFlight = require('../../models/flight/flight.class');

const VNAlert = require('../../models/alert/alert.class');

const func = require('od-utility');


class VNTripAction extends VNAction {


    static async registerAddonForTrip(params, body, query) {

        try {

            const {realm_token, order_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {amount, note} = body;

            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await new VNOrder(order_token).findInstanceDetailWithToken(
                    ['realm_id', 'customer_id']
                );

            if (realm_id !== order_realm_id) func.throwError('REALM_ID NOT MATCH');

            const {vn_trip_id: trip_id, order_id: trip_order_id, realm_id: trip_realm_id} =
                await new VNTrip(trip_token).findInstanceDetailWithToken(['order_id', 'realm_id']);

            if (realm_id !== trip_realm_id) func.throwError('REALM_ID NOT MATCH');
            if (order_id !== trip_order_id) func.throwError('ORDER_ID NOT MATCH');

            const {addon_token} = await new VNAddon().registerAddon(
                {amount, note}, trip_id, order_id, customer_id, realm_id
            );

            return {addon_token};
        } catch (e) {
            throw e;
        }
    }

    static async findTripListInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNTrip.findTripListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findTripWithDriver(params, body, query) {
        try {
            const {realm_token, driver_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await new VNDriver(driver_token).findInstanceDetailWithToken(
                    ['realm_id']
                );

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNTrip.findTripListWithDriver(query, realm_id, driver_id);

        } catch (e) {
            throw e;
        }
    }

    static async findTripDetail(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await new VNTrip(trip_token).findFullTripInfo(realm_id);

        } catch (e) {
            throw e;
        }
    }

    static async registerTripAlert(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const tripObj = new VNTrip(trip_token);

            const {
                vn_trip_id: trip_id, order_id, realm_id: trip_realm_id,
                driver_id, car_id, customer_id
            } = await tripObj.findInstanceDetailWithToken(
                ['order_id', 'realm_id', 'driver_id', 'car_id', 'customer_id']
            );

            if (realm_id !== trip_realm_id) func.throwError('REALM_ID NOT MATCH');


            const {alert_list} = body;

            const alert_promise_list = alert_list.map(raw_alert => {
                const {type, record_time} = raw_alert;

                if (!type) func.throwErrorWithMissingParam('type');
                if (!record_time) func.throwErrorWithMissingParam('record_time');

                return new VNAlert().registerAlert({type, record_time}, order_id, customer_id, trip_id, realm_id);
            });


            const result_list = (await Promise.all(alert_promise_list)).map(result => result.alert_token);


            if (car_id && driver_id) {
                await tripObj.modifyInstanceDetailWithId({status: 3}, ['status']);
            }

            return {alert_list: result_list, trip_token};
        } catch (e) {
            throw e;
        }
    }


    static async modifyTripBasicDetail(params, body, query) {
        try {

            const {realm_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return new VNTrip(trip_token).modifyInstanceDetailWithToken(
                body,
                ['amount', 'is_paid', 'eta_time', 'cob_time', 'arrive_time', 'flight_str', 'start_time', 'cad_time', 'status']
            );
        } catch (e) {
            throw e;
        }
    }

    static async modifyTripOperationInfo(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const tripObj = new VNTrip(trip_token);
            const {vn_trip_id: trip_id, realm_id: trip_realm_id} = await tripObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== trip_realm_id) func.throwErrorWithMissingParam('REALM_ID NOT MATCH');

            const update_pack = {};

            const {driver_token, car_token, flight_token} = body;
            if (driver_token) {
                const {vn_driver_id: driver_id} = await new VNDriver(driver_token).findInstanceDetailWithToken();
                update_pack['driver_id'] = driver_id;
            }

            if (car_token) {
                const {vn_car_id: car_id} = await new VNCar(car_token).findInstanceDetailWithToken();
                update_pack['car_id'] = car_id;
            }

            if (flight_token) {
                const {vn_flight_id: flight_id} = await new VNFlight(flight_token).findInstanceDetailWithToken();
                update_pack['flight_id'] = flight_id;
            }

            await tripObj.modifyInstanceDetailWithId(update_pack, ['driver_id', 'car_id', 'flight_id']);


            const alert_count = await VNAlert.checkTripAlerts(trip_id, realm_id);

            const {car_id, driver_id} = await tripObj.findInstanceDetailWithId(['car_id', 'driver_id']);

            if (alert_count > 0 && car_id && driver_id) {
                await tripObj.modifyInstanceDetailWithId({status: 3}, ['status']);
            }

            return {trip_token};
        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNTripAction;