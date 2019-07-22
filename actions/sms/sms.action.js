const func = require('od-utility');
const VNAction = require('../action.model');

const VNMessageResource = require('../../models/realm/message.resource');

const VNSender = require('../../models/realm/sender.class');

const VNCustomer = require('../../models/customer/customer.class');
const VNCustomerSMS = require('../../models/customer/customer.sms');

const VNTrip = require('../../models/trip/trip.class');

const VNDriverPush = require('../../models/driver/driver.push');

const VNLord = require('../../models/lord/lord.class');

const VNDriver = require('../../models/driver/driver.class');


class VNSMSAction extends VNAction {

    static async sendSMSWithCustomer(params, body, query) {
        try {

            const {realm_token, customer_token} = params;
            const {realm_id, company_name} = await this.findRealmIdWithToken(realm_token);

            const smsResource = await VNMessageResource.findPrimaryMessageResourceWithRealm(realm_id);


            const {twilio_from_num} = smsResource;
            const customerObj = new VNCustomer(customer_token);

            const {message, title, type} = body;

            if (!message) func.throwError('CANNOT SEND EMPTY MESSAGE', 400);
            const {name, cell, vn_customer_id: customer_id} = await customerObj.findInstanceDetailWithToken(['name', 'cell']);
            if (!cell) func.throwErrorWithMissingParam('customer_cell');

            const msg = `${title ? ('#' + title + '#\n') : ''}${name ? ('Dear ' + name + ': \n') : ''}${message + '\n'}${company_name}`;

            const twilio_response = await VNSender.sendSMS(smsResource, msg, cell);


            let lord_id = 0;
            let driver_id = 0;


            if (type === 1) {
                const {lord_token} = query;
                const {vn_lord_id} = await new VNLord(lord_token).findInstanceDetailWithToken();
                lord_id = vn_lord_id;
            }

            if (type === 2) {
                const {driver_token} = query;
                const {vn_driver_id} = await new VNDriver(driver_token).findInstanceDetailWithToken();
                driver_id = vn_driver_id;
            }


            const sms_info = {
                sys_cell: twilio_from_num,
                tar_cell: cell,
                message: msg,
                smsid: twilio_response,
                type: type || 3,
                is_read: 1,
                lord_id,
                driver_id
            };


            const customerSMSObj = new VNCustomerSMS();

            const {sms_token} = await customerSMSObj.registerCustomerSMS(sms_info, customer_id, realm_id);

            return {sms_token, smsid: twilio_response};

            // return {smsid: response};
        } catch (e) {
            throw e;
        }
    }


    static async sendSMSWithDispatch(params, body, query) {
        try {
        } catch (e) {
            throw e;
        }
    }


    static async sendSMSWithOrder(params, body, query) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async sendSMSWithTrip(params, body, query) {

        try {

        } catch (e) {
            throw e;
        }
    }

    static async receiveSMSReply(pamas, body, query) {
        try {
            const {SmsSid, To, From, Body} = body;

            const sms_info = {sys_cell: To, tar_cell: From, message: Body, smsid: SmsSid, type: 4, is_read: 0};

            let customer_id, realm_id, customer_token;

            const {
                customer_id: log_customer_id,
                realm_id: log_realm_id, customer_token: log_customer_token
            } = await VNCustomerSMS.findCustomerSMSRecordWithIncomingReply(
                From, To
            );

            customer_id = log_customer_id;
            realm_id = log_realm_id;
            customer_token = log_customer_token;

            if (!log_customer_id) {
                const {
                    customer_id: exist_customer_id,
                    realm_id: exist_realm_id,
                    exist_customer_token
                } = await VNCustomer.findCustomerInfoWithIncomingSMS(From);
                customer_id = exist_customer_id;
                realm_id = exist_realm_id;
                customer_token = exist_customer_token;
            }

            const {sms_token} = new VNCustomerSMS().registerCustomerSMS(sms_info, customer_id, realm_id);


            if (customer_id && customer_token) {
                const {record_list: trip_list} = await VNTrip.findActiveTripWithCustomer(realm_id, customer_id);
                const promise_list = trip_list.map(info => {
                    const {player_key} = info;
                    return VNDriverPush.sendDriverPush(player_key, 2, customer_token)
                });
                Promise.all(promise_list).then(result => console.log(result)).catch(err => console.log(err));
            }


            return {sms_token, smsid: SmsSid};

        } catch (e) {
            throw e;
        }
    }

    static async findSMSHistoryListWithRealm(params, body, query) {
        try {
            const {realm_token} = params;
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');

            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            return await VNCustomerSMS.findCustomerSMSGroupedMessageInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findSMSHistoryListWithCustomer(params, body, query) {
        try {
            const {customer_token} = params;
            if (!customer_token) func.throwErrorWithMissingParam('customer_token');

            const {vn_customer_id: customer_id} = await new VNCustomer(customer_token).findInstanceDetailWithToken();


            return await VNCustomerSMS.findSMSListWithCustomer(query, customer_id);

        } catch (e) {
            throw e;
        }
    }

    static async modifySMSDetail(params, body, query) {


        try {
            const {sms_token, realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const smsObj = new VNCustomerSMS(sms_token);

            const {realm_id: sms_realm_id} = await smsObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== sms_realm_id) func.throwError('REALM_ID NOT MATCH');


            await smsObj.modifyInstanceDetailWithId(body, ['is_read']);

            return {sms_token};

        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNSMSAction;