const func = require('od-utility');

const VNDiscount = require('../../models/discount/discount.class');

const VNAction = require('../action.model');

class VNDiscountAction extends VNAction {

    static async registerDiscount(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {discount_token} = await new VNDiscount().registerDiscountDetail(body, realm_id);

            return {discount_token};
        } catch (e) {
            throw e;
        }
    }

    static async findDiscountListInReaml(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNDiscount.findDiscountListInRealm(query, realm_id);

        } catch (e) {
            throw e;
        }
    }

    static async modifyDiscountDetail(params, body, query) {
        try {
            const {realm_token, discount_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const discountObj = new VNDiscount(discount_token);

            const {realm_id: discount_realm_id} = await discountObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== discount_realm_id) func.throwError('REALM ID NOT MATCH');

            await discountObj.modifyInstanceDetailWithId(
                body,
                ['status']
            );

            return {discount_token}
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNDiscountAction;