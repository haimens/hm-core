const cron = require("node-cron");

const VNAlert = require('../models/alert/alert.class');
const VNFlight = require('../models/flight/flight.class');

const VNFlightStats = require('../models/flight/fstats.class');
const VNSetting = require('../models/setting/setting.class');
const VNSender = require('../models/realm/sender.class');


const task = cron.schedule('*/5 * * * *', async () => {
    try {
        console.log(`RUNNING FLIGHT ALERT - ${new Date()}`);
        const {record_list: flight_list} = await VNAlert.findFlightAlertInSystem();


        for (let i = 0; i < flight_list.length; i++) {
            const {
                flight_key, twilio_account_id, twilio_auth_token, twilio_from_num, order_id, trip_id, customer_id,
                flight_str,
                customer_name, customer_cell, driver_name, driver_cell, realm_id
            } = flight_list[i];

            const is_inserted = await VNAlert.checkTripFlightAlertInserted(trip_id, realm_id);

            if (is_inserted) continue;

            const {is_change, change_str, curr_flight} = await _compareFlightWithKey(flight_key);
            if (is_change) {
                const {value: contact_cell} = await VNSetting.findSettingInfoWithKey(realm_id, 'contact_cell');

                const msg =
                    `*FLIGHT ALERT*\n
                    [${flight_str}]
                    ${change_str} Driver: ${driver_name} - ${driver_cell} \n
                    Customer: ${customer_name} - ${customer_cell} \n`;
                await VNSender.sendSMS(
                    {
                        twilio_account_id,
                        twilio_auth_token,
                        twilio_from_num
                    }, msg, contact_cell);

                await new VNAlert().registerAlert({
                    type: 4,
                    record_time: 'now()'
                }, order_id, customer_id, trip_id, realm_id);
                await new VNFlight().registerFlight(curr_flight)
            }

        }


    } catch (e) {
        console.log('FLIGHT ALERT CRON ERROR', e);
    }
});


async function _compareFlightWithKey(flight_key) {

    try {

        const curr_flight = await new VNFlightStats().findFlight(flight_key);
        const org_flight = await new VNFlight(null, null, flight_key).findFlightInfoWithKey();

        let is_change = false;
        const changes = [];

        if (org_flight.arr_date !== curr_flight.arr_date) {
            is_change = true;
            changes.push(`Arrival Time: ${org_flight.arr_date} => ${curr_flight.arr_date}`);
        }


        if (org_flight.arr_terminal !== curr_flight.arr_terminal) {
            is_change = true;
            changes.push(`Arrival Terminal: ${org_flight.arr_terminal} => ${org_flight.arr_terminal}`);
        }

        return {is_change, change_str: changes.join(', '), curr_flight};

    } catch (e) {
        throw e;
    }
}


module.exports = task;