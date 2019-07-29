const cron = require("node-cron");

const VNAlert = require('../models/alert/alert.class');
const VNFlight = require('../models/flight/flight.class');

const VNFlightStats = require('../models/flight/fstats.class');
const VNSetting = require('../models/setting/setting.class');
const VNSender = require('../models/realm/sender.class');


const task = cron.schedule('* * * * *', async () => {
    try {
        console.log(`RUNNING FLIGHT ALERT - ${new Date()}`);
        const {record_list: flight_list} = await VNAlert.findFlightAlertInSystem();

        console.log(flight_list);
        for (let i = 0; i < flight_list.length; i++) {
            const {
                flight_key, twilio_account_id, twilio_auth_token, twilio_from_num,
                type_str, customer_name, customer_cell, driver_name, driver_cell, realm_id, alert_id
            } = flight_list[i];
            const {is_change, change_str} = await _compareFlightWithKey(flight_key);
            if (is_change) {
                const {contact_cell} = await VNSetting.findSettingInfoWithKey(realm_id, 'contact_cell');
                const msg =
                    `*${type_str} ALERT*\n ${change_str} Driver: ${driver_name} - ${driver_cell} \n
                    Customer: ${customer_name} - ${customer_cell} \n`;
                await VNSender.sendSMS(
                    {
                        twilio_account_id,
                        twilio_auth_token,
                        twilio_from_num
                    }, msg, contact_cell);

                await new VNAlert(null, alert_id).updateInstance({status: 3});
                await new VNFlight().registerFlight(cu)
            }

        }


    } catch (e) {
        console.log('FLIGHT ALERT CRON ERROR', e);
    }
});


async function _compareFlightWithKey(flight_key) {

    try {
        const org_flight = await new VNFlight(null, null, flight_key).findFlightInfoWithKey();
        const curr_flight = await new VNFlightStats().findFlight(flight_key);

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

        return {is_change, change_str: changes.join(', ')};

    } catch (e) {
        throw e;
    }
}


module.exports = task;