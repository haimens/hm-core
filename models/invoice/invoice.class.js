const ODInstance = require('../instance.model');

const ODCondition = require('../condition.model');


class VNInvoice extends ODInstance {

    constructor(invoice_token, invoice_id) {
        super('vn_invoice', 'invoice_token', invoice_token, invoice_id);
    }

    async registerInvoice(params, body, query) {
        try {
        } catch (e) {
            throw e;
        }
    }


    static async findInvoiceListInSystem(search_query = {}) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async findInvoiceListInRealm(search_query = {}, realm_id) {
        try {
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNInvoice;