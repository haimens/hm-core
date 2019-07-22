const func = require('od-utility');

const VNAction = require('../action.model');

const VNOrderNote = require('../../models/order/order.note');

const VNCustomer = require('../../models/customer/customer.class');

const VNOrder = require('../../models/order/order.class');

const VNTrip = require('../../models/trip/trip.class');


class VNNoteAction extends VNAction {


    static async registerOrderNoteWithCustomer(params, body, query) {
        try {
            const {realm_token, customer_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);

            const {vn_customer_id: customer_id, realm_id: customer_realm_id} =
                await new VNCustomer(customer_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            const orderNoteObj = new VNOrderNote();

            const {note, type} = body;

            const {order_note_token} = await orderNoteObj.registerOrderNote(
                {
                    note,
                    type: type || 1
                }, realm_id, customer_id);

            return {order_note_token};


        } catch (e) {
            throw e;
        }
    }

    static async registerOrderNoteWithOrder(params, body, query) {
        try {
            const {realm_token, order_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);
            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await new VNOrder(order_token).findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM_ID NOT MATCH');

            const orderNoteObj = new VNOrderNote();
            const {note, type} = body;
            const {order_note_token} = await orderNoteObj.registerOrderNote({
                note,
                type: type || 2
            }, realm_id, customer_id, order_id);

            return {order_note_token};
        } catch (e) {
            throw e;
        }
    }

    static async registerOrderNoteWithTrip(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);
            const {vn_trip_id: trip_id, realm_id: trip_realm_id, customer_id, order_id} =
                await new VNTrip(trip_token).findInstanceDetailWithToken(['realm_id', 'customer_id', 'order_id']);

            if (realm_id !== trip_realm_id) func.throwError('REALM_ID NOT MATCH');

            const orderNoteObj = new VNOrderNote();
            const {order_note_token} = await orderNoteObj.registerOrderNote({
                ...body,
                type: 2
            }, realm_id, customer_id, order_id, trip_id);

            return {order_note_token};

        } catch (e) {
            throw e;
        }
    }

    static async findOrderNoteListWithCustomer(params, body, query) {
        try {
            const {realm_token, customer_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);

            const {vn_customer_id: customer_id, realm_id: customer_realm_id} =
                await new VNCustomer(customer_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNOrderNote.findOrderNoteListWithCustomer(query, realm_id, customer_id);
        } catch (e) {
            throw e;
        }
    }

    static async findOrderNoteListWithOrder(params, body, query) {
        try {
            const {realm_token, order_token} = params;
            const {realm_id} = await  this.findRealmIdWithToken(realm_token);

            const {vn_order_id: order_id, realm_id: order_realm_id} =
                await new VNOrder(order_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNOrderNote.findOrderNoteListWithOrder(query, realm_id, order_id);

        } catch (e) {
            throw e;
        }
    }

    static async findOrderNoteListWithTrip(params, body, query) {
        try {
            const {realm_token, trip_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);

            const {realm_id: trip_realm_id, order_id} =
                await new VNTrip(trip_token).findInstanceDetailWithToken(['realm_id', 'order_id']);

            if (realm_id !== trip_realm_id) func.throwError('REALM_ID NOT MATCH');

            return await VNOrderNote.findOrderNoteListWithOrder(query, realm_id, order_id);

        } catch (e) {
            throw e;
        }
    }

    static async modifyOrderNoteDetail(params, body, query) {
        try {
            const {realm_token, order_note_token} = params;

            const {realm_id} = await  this.findRealmIdWithToken(realm_token);

            const noteObj = new VNOrderNote(order_note_token);

            const {realm_id: note_realm_id} = await noteObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== note_realm_id) func.throwError('REALM_ID NOT MATCH');

            await noteObj.modifyInstanceDetailWithId(body, ['status', 'note']);

            return {order_note_token};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNNoteAction;