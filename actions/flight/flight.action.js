const func = require('od-utility');

const VNAction = require('../action.model');

const VNFlight = require('../../models/flight/flight.class');

const VNFlightStats = require('../../models/flight/fstats.class');

class VNFlightAction extends VNAction {
    static async searchFlight(params, body, query) {
        try {

            const {realm_token} = params;

            const {realm_id, status} = await this.findRealmIdWithToken(realm_token);


            if (!realm_id) func.throwErrorWithMissingParam('realm_id');
            if (status !== 2) func.throwError('REALM CLOSED');


            const {flight_list} = await new VNFlightStats().lookUp(body);

            const promise_list = flight_list.map(raw_info => {
                return new VNFlight().registerFlight(raw_info);
            });

            const record_list = await Promise.all(promise_list);



            return {record_list}
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNFlightAction;