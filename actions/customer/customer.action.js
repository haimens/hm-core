const func = require('od-utility');
const VNAction = require('../action.model');
const VNCustomer = require('../../models/customer/customer.class');
const VNRealm = require('../../models/realm/realm.class');
const redis = require('od-utility-redis');

class VNCustomerAction extends VNAction {
    static async checkCustomerWithKey(params, body, query) {
        const {customer_key} = params;
        if (!customer_key) func.throwErrorWithMissingParam('customer_key');

        try {
            const customer_detail = await redis.getAsync('CUSTOMER-CHECK', customer_key);
            if (customer_detail) return customer_detail;

            const {customer_token} = await VNCustomer.findCustomerTokenWithKey(customer_key);
            if (!customer_token) func.throwError('This user is not registered in this system');

            const customerObj = new VNCustomer(customer_token);
            const {customer_status, realm_id, ...customer_info} = await customerObj.findInstanceDetailWithToken([
                'name', 'cell', 'email', 'username', 'cdate', 'udate',
                'customer_key', 'status AS customer_status', 'customer_token', 'realm_id'
            ]);

            if (customer_status !== 2) return {isValid: false, message: 'CUSTOMER SUSPENDED'};


            const realmObj = new VNRealm(null, realm_id);

            const {realm_token, icon_path, logo_path, realm_status} =
                await realmObj.findInstanceDetailWithId(
                    ['realm_token', 'icon_path', 'logo_path', 'status AS realm_status']
                );

            if (realm_status !== 2) return {isValid: false, message: 'REALM SUSPENDED'};

            const response = {isValid: true, ...customer_info, realm_token, icon_path, logo_path};

            await redis.setAsync('CUSTOMER-CHECK', customer_key, response);

            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNCustomerAction;