const cron = require("node-cron");

const VNAlert = require('../models/alert/alert.class');
const VNSetting = require('../models/setting/setting.class');
const VNSender = require('../models/realm/sender.class');

const task = cron.schedule('* * * * *', () => {
    try {
        console.log(`RUNNING ALERT - ${new Date()}`);


        VNAlert
            .findAlertInSystem()
            .then(info => {
                const {record_list: alert_list} = info;
                return alert_list;
            })
            .then(alert_list => {
                const promise_list = alert_list.map(alert_info => {
                    const {realm_id, ...other_info} = alert_info;

                    return new Promise((resolve, reject) => {
                        VNSetting
                            .findSettingInfoWithKey(realm_id, 'contact_cell')
                            .then(contact_info => {
                                const {value: contact_cell} = contact_info;
                                return {...other_info, contact_cell};
                            })
                            .then(combined_info => {
                                const {
                                    twilio_account_id, twilio_auth_token, twilio_from_num,
                                    contact_cell, type_str, customer_name, customer_cell, driver_name, driver_cell,
                                } = combined_info;
                                return new Promise((send_reso, send_rejc) => {
                                    const msg = `*${type_str} ALERT*\nDriver: ${driver_name} - ${driver_cell} \nCustomer: ${customer_name} - ${customer_cell} \n
                                    `;
                                    VNSender
                                        .sendSMS({
                                            twilio_account_id,
                                            twilio_auth_token,
                                            twilio_from_num
                                        }, msg, contact_cell)
                                        .then(() => send_reso({msg, ...combined_info}))
                                        .catch(send_rejc)
                                });
                            })
                            .then((sent_info) => {
                                const {alert_id} = sent_info;
                                const alertObj = new VNAlert(null, alert_id);
                                alertObj.updateInstance({status: 3}).then(() => resolve(sent_info));
                            })
                            .catch(reject);

                    });
                });

                Promise.all(promise_list).then(result_list => {
                    console.log(result_list);
                }).catch(e => console.log(e));
            })


    } catch (e) {
        console.log('ALERT CRON ERROR', e);
    }
});


module.exports = task;