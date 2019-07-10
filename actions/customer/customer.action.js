const func = require('od-utility');
const VNAction = require('../action.model');
const VNCustomer = require('../../models/customer/customer.class');
const VNRealm = require('../../models/realm/realm.class');

const VNAddress = require('../../models/address/address.class');

const redis = require('od-utility-redis');

class VNCustomerAction extends VNAction {

    static async registerCustomer(params, body, query) {
        try {
            const {realm_token} = params;

            const {customer_info, address_info} = body;
            if (!realm_token) func.throwErrorWithMissingParam('realm_token');
            const realmObj = new VNRealm(realm_token);

            const {vn_realm_id: realm_id} = await realmObj.findInstanceDetailWithToken();

            let address_id = 0;
            if (address_info) {
                const {address_token} = address_info;
                const addressObj = new VNAddress(address_token);
                const {vn_address_id: customer_addr_id} = await addressObj.findInstanceDetailWithToken();
                address_id = customer_addr_id;
            }

            const customerObj = new VNCustomer();

            const {customer_token, username, user_token, instance_token} = await customerObj.registerCustomer(customer_info, realm_id, address_id);

            return {customer_token, username, user_token, instance_token};
        } catch (e) {
            throw e;
        }
    }

    static async checkCustomerWithKey(params, body, query) {
        const {customer_key} = params;
        if (!customer_key) func.throwErrorWithMissingParam('customer_key');

        try {
            const customer_detail = await redis.getAsync('CUSTOMER-CHECK', customer_key);
            if (customer_detail) return customer_detail;

            const {customer_token} = await VNCustomer.findCustomerTokenWithKey(customer_key);
            if (!customer_token) func.throwError('This user is not registered in this system');

            const customerObj = new VNCustomer(customer_token);
            const {customer_status, realm_id, vn_customer_id, ...customer_info} = await customerObj.findInstanceDetailWithToken([
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


    static async findCustomerListWithRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNCustomer.findCustomerListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findCustomerDetail(params, body, query) {
        try {

            const {realm_token, customer_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const customerObj = new VNCustomer(customer_token);

            const {realm_id: customer_realm_id} = await customerObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await customerObj.findCustomerDetail(realm_id);


        } catch (e) {
            throw e;
        }
    }

    static async modifyCustomerDetail(params, body, query) {
        try {
            const {realm_token, customer_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const customerObj = new VNCustomer(customer_token);

            const {realm_id: customer_realm_id} = await customerObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            await customerObj.modifyInstanceDetailWithToken(body, ['name', 'cell', 'email', 'img_path']);

            return {customer_token};
        } catch (e) {
            throw e;
        }

    }

    static async modifyCustomerInfo(params, body, query) {
        try {
            const {realm_token, customer_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const customerObj = new VNCustomer(customer_token);

            const {address_token} = body;

            const update_pack = {};

            if (address_token) {
                const {vn_address_id: address_id} = await new VNAddress(address_token).findInstanceDetailWithToken();
                update_pack['address_id'] = address_id;
            }

            const {realm_id: customer_realm_id} = await customerObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            await customerObj.modifyInstanceDetailWithToken(update_pack, ['address_id']);

            return {customer_token};
        } catch (e) {
            throw e;
        }

    }
}

module.exports = VNCustomerAction;