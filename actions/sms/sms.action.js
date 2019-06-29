const func = require('od-utility');
const VNAction = require('../action.model');

const VNMessageResource = require('../../models/realm/message.resource');

const VNSender = require('../../models/realm/sender.class');

const VNCustomer = require('../../models/customer/customer.class');


class VNSMSAction extends VNAction {

    static async sendSMSWithCustomer(params, body, query) {
        try {

            const {realm_token, customer_token} = params;
            const {realm_id, company_name} = await this.findRealmIdWithToken(realm_token);

            const smsResource = await VNMessageResource.findPrimaryMessageResourceWithRealm(realm_id);


            const customerObj = new VNCustomer(customer_token);

            const {message, title} = body;
            if (!message) func.throwError('CANNOT SEND EMPTY MESSAGE', 400);
            const {name, cell} = await customerObj.findInstanceDetailWithToken(['name', 'cell']);
            if (!cell) func.throwErrorWithMissingParam('customer_cell');

            const msg = `${title ? ('#' + title + '#\n') : ''}${name ? ('Dear ' + name + ': \n') : ''}${message + '\n'}${company_name}`;

            const response = await VNSender.sendSMS(smsResource, msg, cell);

            console.log(response);


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

}

module.exports = VNSMSAction;