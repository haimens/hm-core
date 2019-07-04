const VNAction = require('../action.model');

const VNTrip = require('../../models/trip/trip.class');

const VNAddon = require('../../models/addon/addon.class');

const VNOrder = require('../../models/order/order.class');

const VNDriver = require('../../models/driver/driver.class');

const VNCar = require('../../models/car/car.class');

const VNFlight = require('../../models/flight/flight.class');

const VNAlert = require('../../models/alert/alert.class');

const VNCustomer = require('../../models/customer/customer.class');

const VNAddress = require('../../models/address/address.class');

const func = require('od-utility');


class VNTripAction extends VNAction {


    static async registerAddonForTrip(params, body, query) {

        try {

            const {realm_token, order_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {amount, note, type} = body;

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
                {amount, note, type}, trip_id, order_id, customer_id, realm_id
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

            const {realm_id: trip_realm_id, trip_id, driver_id, car_id, customer_id, from_address_id, to_address_id, flight_id, ...basic_info} =
                await new VNTrip(trip_token).findFullTripInfo(realm_id);

            if (realm_id !== trip_realm_id) func.throwError('REALM NOT MATCH');

            const promise_list = [

                //DRIVER 0
                driver_id ? (new VNDriver(null, driver_id).findInstanceDetailWithId(
                    ['name', 'cell', 'license_num', 'email', 'img_path', 'cdate', 'udate', 'driver_token']))
                    : {},

                //CAR 1
                car_id ? (new VNCar(null, car_id).findInstanceDetailWithId([
                    'img_path', 'identifier', 'description', 'cdate', 'udate',
                    'car_token', 'plate_num'
                ])) : {},

                //CUSTOMER 2
                customer_id ? (new VNCustomer(null, customer_id).findInstanceDetailWithId(
                    ['name', 'cell', 'email', 'img_path', 'customer_token', 'cdate', 'udate']
                )) : {},

                //FROM ADDRESS 3
                from_address_id ? (new VNAddress(null, from_address_id).findInstanceDetailWithId(
                    ['street_line_1', 'street_line_2', 'city', 'state', 'zip', 'addr_str', 'lat', 'lng']
                )) : {},

                //TO ADDRESS 4
                to_address_id ? (new VNAddress(null, to_address_id).findInstanceDetailWithId(
                    ['street_line_1', 'street_line_2', 'city', 'state', 'zip', 'addr_str', 'lat', 'lng']
                )) : {},

                //FLIGHT INFO 5
                flight_id ? (new VNFlight(null, flight_id).findInstanceDetailWithId(
                    ['flight_key', 'dep_date', 'arr_date', 'carrier_code',
                        'flight_num', 'dep_airport', 'arr_airport',
                        'dep_terminal', 'arr_terminal', 'flight_token', 'cdate', 'udate']
                )) : {},

                //ADDON LIST 6
                VNAddon.findAddonListInTrip(trip_id, realm_id),

                //ALERT LIST 7
                VNAlert.findAlertListInRealm(trip_id, realm_id)
            ];

            const result_list = await Promise.all(promise_list);

            const driver_info = result_list[0];
            const car_info = result_list[1];
            const customer_info = result_list[2];
            const from_address_info = result_list[3];
            const to_address_info = result_list[4];
            const flight_info = result_list[5];

            const {record_list: addon_list} = result_list[6];

            const {record_list: alert_list} = result_list[7];


            return {
                driver_info, car_info, customer_info,
                from_address_info,
                to_address_info, flight_info, addon_list,
                alert_list,
                basic_info
            };

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

            const tripObj = new VNTrip(trip_token);

            const {realm_id: trip_realm_id} = await tripObj.findInstanceDetailWithToken(['realm_id']);

            if (trip_realm_id !== realm_id) func.throwError('REALM_ID NOT MATCH');

            return tripObj.modifyInstanceDetailWithId(
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

            const {car_id, driver_id, status} = await tripObj.findInstanceDetailWithId(['car_id', 'driver_id', 'status']);

            if (alert_count > 0 && car_id && driver_id) {
                if (status === 2) {
                    await tripObj.modifyInstanceDetailWithId({status: 3}, ['status']);
                }
            }

            return {trip_token};
        } catch (e) {
            throw e;
        }
    }

    static async findMonthCountForTripInRealm(params, body, query) {
        try {

            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNTrip.findTripCountForMonth(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNTripAction;