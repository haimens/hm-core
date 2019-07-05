const func = require('od-utility');
const VNRealm = require('../../models/realm/realm.class');
const VNAction = require('../action.model');
const VNTributeRate = require('../../models/tribute/rate.class');
const VNAddress = require('../../models/address/address.class');

const VNGoogleMap = require('../../models/address/google.class');

const VNSetting = require('../../models/setting/setting.class');

const VNCarType = require('../../models/car/car.type');

const VNMessageResource = require('../../models/realm/message.resource');
const VNEmailResource = require('../../models/realm/email.resource');
const VNPaymentResource = require('../../models/realm/payment.resource');


const sedan = {
    name: 'SEDAN', price_prefix: '0',
    img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a1e60dc78feea85181d7b56979a766e4.jpeg',
    max_capacity: 4
};
const minivan = {
    name: 'MINIVAN', price_prefix: '1000',
    img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a3fcff7ad2625723da1c84bf35ef101b.jpeg',
    max_capacity: 6
};

class VNRealmAction extends VNAction {

    static async registerRealm(params, body, query) {
        try {

            const {tribute_rate_token, realm_info, address_str} = body;

            const rateObj = new VNTributeRate(tribute_rate_token);

            const {vn_tribute_rate_id: tribute_rate_id} = await rateObj.findInstanceDetailWithToken();

            const addressObj = new VNAddress();

            const address_info = await VNGoogleMap.findFormattedAddress(address_str);

            if (!address_info) func.throwError('ADDRESS CANNOT BE FOUND', 400);

            const {address_id, address_token} = await addressObj.registerAddress(address_info);

            const realmObj = new VNRealm();

            const {realm_token, realm_id} = await realmObj.registerRealm(realm_info, tribute_rate_id, address_id);


            await Promise.all(
                [
                    new VNSetting().registerSetting('price_base', 3000, realm_id),
                    new VNSetting().registerSetting('price_minute', 35, realm_id),
                    new VNSetting().registerSetting('price_mile', 175, realm_id),
                    new VNCarType().registerCarType(sedan, realm_id),
                    new VNCarType().registerCarType(minivan, realm_id)
                ]
            );


            return {address_token, realm_token};
        } catch (e) {
            throw e;
        }
    }

    static async findRealmListInSystem(params, body, query) {
        try {
            return await VNRealm.findRealmListInSystem(query);
        } catch (e) {
            throw e;
        }
    }

    static async modifyBasicRealmDetail(params, body, query) {
        try {
            const {realm_token} = params;

            const realmObj = new VNRealm(realm_token);

            const response = await realmObj.modifyInstanceDetailWithToken(
                body,
                ['company_name', 'company_title', 'status', 'logo_path', 'icon_path', 'status']
            );
            return {response};
        } catch (e) {
            throw e;
        }
    }

    static async modifyPrimaryResourceInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const realmObj = new VNRealm(realm_token);

            const {message_resource_token, email_resource_token, payment_resource_token} = body;
            const update_pack = {};
            if (message_resource_token) {
                const {vn_message_resource_id} = await new VNMessageResource(message_resource_token).findInstanceDetailWithToken();
                update_pack['primary_message_resource_id'] = vn_message_resource_id
            }

            if (email_resource_token) {
                const {vn_email_resource_id} = await new VNEmailResource(email_resource_token).findInstanceDetailWithToken();
                update_pack['primary_email_resource_id'] = vn_email_resource_id
            }


            if (payment_resource_token) {
                const {vn_payment_resource_id} = await new VNPaymentResource(payment_resource_token).findInstanceDetailWithToken();
                update_pack['primary_payment_resource_id'] = vn_payment_resource_id
            }


            const response = await realmObj.modifyInstanceDetailWithId(update_pack,
                ['primary_message_resource_id', 'primary_email_resource_id', 'primary_payment_resource_id']
            );

            return {response};


        } catch (e) {
            throw e;
        }
    }


    static async registerMessageResource(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id, realmObj} = await this.findRealmIdWithToken(realm_token);
            const messageResourceObj = new VNMessageResource();

            const {message_resource_token, message_resource_id} = await messageResourceObj.registerMessageResource(body, realm_id);


            await realmObj.modifyInstanceDetailWithId(
                {primary_message_resource_id: message_resource_id},
                ['primary_message_resource_id']
            );

            return {message_resource_token};
        } catch (e) {
            throw e;
        }
    }


    static async registerPaymentResource(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id, realmObj} = await this.findRealmIdWithToken(realm_token);
            const paymentResourceObj = new VNPaymentResource();

            const {payment_resource_token, payment_resource_id} = await paymentResourceObj.registerPaymentResource(body, realm_id);


            await realmObj.modifyInstanceDetailWithId(
                {primary_payment_resource_id: payment_resource_id},
                ['primary_payment_resource_id']
            );

            return {payment_resource_token};
        } catch (e) {
            throw e;
        }
    }

    static async registerEmailResource(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id, realmObj} = await this.findRealmIdWithToken(realm_token);
            const emailResourceObj = new VNEmailResource();

            const {email_resource_token, email_resource_id} = await emailResourceObj.registerEmailResource(body, realm_id);


            await realmObj.modifyInstanceDetailWithId(
                {primary_email_resource_id: email_resource_id},
                ['primary_email_resource_id']
            );

            return {email_resource_token};
        } catch (e) {
            throw e;
        }
    }

    static async findEmailResourceList(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNEmailResource.findEmailResourceListWithRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findMessageResourceList(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNMessageResource.findMessageResourceListWithRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifyMessageResource(params, body, query) {
        try {
            const {realm_token, message_resource_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const messageResourceObj = new VNMessageResource(message_resource_token);

            const {realm_id: auth_realm_id} = await messageResourceObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');
            const response = await messageResourceObj.modifyInstanceDetailWithId(
                body,
                ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num', 'status']);

            return {response};

        } catch (e) {
            throw e;
        }
    }

    static async findPaymentResourceList(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNPaymentResource.findPaymentResourceListWithRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async modifyEmailResource(params, body, query) {
        try {
            const {realm_token, email_resource_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const emailResourceObj = new VNEmailResource(email_resource_token);

            const {realm_id: auth_realm_id} = await emailResourceObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');
            const response = await emailResourceObj.modifyInstanceDetailWithId(
                body,
                ['sendgrid_api_key', 'sendgrid_from_email', 'status']);

            return {response};

        } catch (e) {
            throw e;
        }
    }

    static async modifyPaymentResource(params, body, query) {
        try {
            const {realm_token, payment_resource_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const paymentResourceObj = new VNPaymentResource(payment_resource_token);

            const {realm_id: auth_realm_id} = await paymentResourceObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');
            const response = await paymentResourceObj.modifyInstanceDetailWithId(
                body,
                ['square_application_id', 'square_location_id', 'square_access_token', 'status']);

            return {response};

        } catch (e) {
            throw e;
        }
    }


    static async findRealmDetail(params, body, query) {
        try {
            const {realm_token} = params;

            const {
                primary_message_resource_id, primary_email_resource_id, primary_payment_resource_id,
                tribute_rate_id, address_id,
                ...basic_info
            } = await new VNRealm(realm_token).findInstanceDetailWithToken([
                'primary_message_resource_id', 'primary_email_resource_id', 'primary_payment_resource_id',
                'address_id', 'logo_path', 'icon_path',
                'tribute_rate_id', 'company_name', 'company_title', 'realm_token', 'cdate', 'udate', 'status'
            ]);

            let message_resource_info = {};
            if (primary_message_resource_id) {
                const {twilio_account_id, twilio_auth_token, twilio_from_num, message_resource_token} =
                    await new VNMessageResource(null, primary_message_resource_id).findInstanceDetailWithId(
                        ['twilio_account_id', 'twilio_auth_token', 'twilio_from_num', 'message_resource_token']);

                message_resource_info = {twilio_account_id, twilio_auth_token, twilio_from_num, message_resource_token};
            }

            let payment_resource_info = {};
            if (primary_payment_resource_id) {
                const {square_application_id, square_location_id, square_access_token, payment_resource_token} =
                    await new VNPaymentResource(null, primary_payment_resource_id).findInstanceDetailWithId(
                        ['square_application_id', 'square_location_id', 'square_access_token', 'payment_resource_token']);

                payment_resource_info = {
                    square_application_id,
                    square_location_id,
                    square_access_token,
                    payment_resource_token
                };
            }


            let email_resource_info = {};
            if (primary_email_resource_id) {
                const {sendgrid_api_key, sendgrid_from_email, email_resource_token} =
                    await new VNEmailResource(null, primary_email_resource_id).findInstanceDetailWithId(
                        ['sendgrid_api_key', 'sendgrid_from_email', 'email_resource_token']);

                email_resource_info = {sendgrid_api_key, sendgrid_from_email, email_resource_token};
            }

            const address_info = await new VNAddress(null, address_id).findInstanceDetailWithId(
                ['addr_str', 'lat', 'lng', 'street_line_1', 'street_line_2', 'city', 'state', 'zip']
            );

            const tribute_rate_info = await
                new VNTributeRate(null, tribute_rate_id).findInstanceDetailWithId(
                    ['rate', 'tribute_rate_token']
                );

            return {
                basic_info,
                message_resource_info,
                email_resource_info,
                payment_resource_info,
                address_info,
                tribute_rate_info
            };
        } catch (e) {
            throw e;
        }
    }

}


module.exports = VNRealmAction;