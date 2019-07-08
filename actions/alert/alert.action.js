const VNAction = require('../action.model');
const VNAlert = require('../../models/alert/alert.class');

const VNDriver = require('../../models/driver/driver.class');

const VNTrip = require('../../models/trip/trip.class');

const func = require('od-utility');


class VNAlertAction extends VNAction {

    static async findAlertListInRealm(params, body, query) {

        try {
            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNAlert.findAlertListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }


    static async findAlertListWithDriver(params, body, query) {
        try {
            const {realm_token, driver_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const {vn_driver_id: driver_id, realm_id: driver_realm_id} =
                await VNDriver(driver_token);

            if (realm_id !== driver_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNAlert.findAlertListWithDriver(query, realm_id, driver_id);

        } catch (e) {
            throw e;
        }
    }


    static async modifyAlert(params, body, query) {
        try {
            const {realm_token, alert_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const alertObj = new VNAlert(alert_token);

            const {realm_id: alert_realm_id} = await alertObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== alert_realm_id) func.throwError('REALM_ID NOT MATCH');

            await alertObj.modifyInstanceDetailWithId(body, ['status']);
        } catch (e) {
            throw e;
        }
    }

    static async findAlertListInTrip(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            if (!trip_token) func.throwErrorWithMissingParam('trip_token');


            const tripObj = new VNTrip(trip_token);

            const {vn_trip_id: trip_id, realm_id: trip_realm_id} = await tripObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== trip_realm_id) func.throwError('REAM_ID NOT MATCH');

            return await VNAlert.findAlertListInTrip(trip_id, realm_id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNAlertAction;