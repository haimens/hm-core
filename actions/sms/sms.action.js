const func = require('od-utility');
const VNAction = require('../action.model');

const VNMessageResource = require('../../models/realm/message.resource');

const VNSender = require('../../models/realm/sender.class');

const VNCustomer = require('../../models/customer/customer.class');
const VNCustomerSMS = require('../../models/customer/customer.sms');


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


            const sms_info = {
                sys_cell: twilio_from_num,
                tar_cell: cell,
                message: msg,
                smsid: twilio_response,
                type: type || 3
            };


            const customerSMSObj = new VNCustomerSMS();

            const {sms_token} = await customerSMSObj.registerCustomerSMS(sms_info, customer_id, realm_id);

            return {sms_token, smsid: twilio_response};

            // return {smsid: response};
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

            const sms_info = {sys_cell: To, tar_cell: From, message: Body, smsid: SmsSid, type: 4};

            let customer_id, realm_id;

            const {customer_id: log_customer_id, realm_id: log_realm_id} = await VNCustomerSMS.findCustomerSMSRecordWithIncomingReply(
                From, To
            );

            customer_id = log_customer_id;
            realm_id = log_realm_id;


            if (!log_customer_id) {
                const {customer_id: exist_customer_id, realm_id: exist_realm_id} = await VNCustomer.findCustomerInfoWithIncomingSMS(From);
                customer_id = exist_customer_id;
                realm_id = exist_realm_id;
            }

            const {sms_token} = new VNCustomerSMS().registerCustomerSMS(sms_info, customer_id, realm_id);

            return {sms_token, smsid: SmsSid};

        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNSMSAction;