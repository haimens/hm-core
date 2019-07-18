const func = require('od-utility');
const VNAction = require('../action.model');

const VNEmailResource = require('../../models/realm/email.resource');

const VNSender = require('../../models/realm/sender.class');
const VNCustomer = require('../../models/customer/customer.class');


class VNEmailAction extends VNAction {

    static async sendEmailWithCustomer(params, body, query) {
        try {

            const {realm_token, customer_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {title, msg} = body;

            const {email, realm_id: customer_realm_id} = new VNCustomer(customer_token).findInstanceDetailWithToken(['email', 'realm_id']);


            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');


            const email_resource = await VNEmailResource.findPrimaryEmailResourceWithRealm(realm_id);
            
            const {sendgrid_api_key, sendgrid_from_email} = email_resource;

            const response = await VNSender.sendEmail(sendgrid_api_key, sendgrid_from_email, email, title, msg);

            return {response, customer_token};

        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNEmailResource;


