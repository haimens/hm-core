const func = require('od-utility');

const VNAction = require('../action.model');

const VNInvoice = require('../../models/invoice/invoice.class');
const VNCoin = require('../../models/coin/coin.class');


class VNInvoiceAction extends VNAction {


    static async registerInvoice(params, body, query) {
        try {
            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {coin_token} = body;
            const {vn_coin_id: coin_id} = await new VNCoin(coin_token).findInstanceDetailWithToken();

            const {invoice_token} = await new VNInvoice().registerInvoice(realm_id, coin_id);

            return {invoice_token};
        } catch (e) {

            throw e;
        }
    }


    static async findInvoiceListInRealm(params, body, query) {
        try {
            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            return await VNInvoice.findInvoiceListWithRealm(query, realm_id);
        } catch (e) {

            throw e;
        }
    }

    static async findInvoiceListInSystem(params, body, query) {
        try {
            return await VNInvoice.findInvoiceListInSystem(query);
        } catch (e) {
            throw e;
        }
    }

    static async findInvoiceSumInRealm(params, body, query) {
        try {

            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const sum = await VNInvoice.findInvoiceSumWithRealm(query, realm_id);

            return {sum};
        } catch (e) {
            throw e;
        }
    }


    static async findInvoiceSumInSystem(params, body, query) {
        try {

            const {realm_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);
            const sum = await VNInvoice.findInvoiceSumInSystem(query, realm_id);

            return {sum};
        } catch (e) {
            throw e;
        }
    }

    static async modifyInvoiceDetail(params, body, query) {
        try {
            const {realm_token, invoice_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const invoiceObj = new VNInvoice(invoice_token);
            const {realm_id: invoice_realm_id} =
                await invoiceObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== invoice_realm_id) func.throwError('REALM_ID NOT MATCH');

            await invoiceObj.modifyInstanceDetailWithId(body, ['receipt', 'status']);


            return {invoice_token};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNInvoiceAction;