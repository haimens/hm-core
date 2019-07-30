const func = require('od-utility');
const utility = require('../../services/vn.func');
const VNAction = require('../action.model');

const VNLord = require('../../models/lord/lord.class');
const VNCustomer = require('../../models/customer/customer.class');
const VNOrder = require('../../models/order/order.class');
const VNTrip = require('../../models/trip/trip.class');
const VNQuote = require('../../models/quote/quote.class');

const VNAddon = require('../../models/addon/addon.class');
const VNOrderDiscount = require('../../models/order/order.discount');

const VNCoin = require('../../models/coin/coin.class');
const VNDiscount = require('../../models/discount/discount.class');

const VNTribute = require('../../models/tribute/tribute.class');

const VNWage = require('../../models/wage/wage.class');

const VNRealm = require('../../models/realm/realm.class');

const VNOrderNote = require('../../models/order/order.note');

class VNOrderAction extends VNAction {


    static async registerOrder(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {lord_token} = query;

            let lord_id = 0;
            if (lord_token) {
                const {vn_lord_id, realm_id: auth_realm_id} =
                    await new VNLord(lord_token).findInstanceDetailWithToken(['realm_id']);
                if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');
                lord_id = vn_lord_id;
            }

            const {customer_token, quote_list, note} = body;

            if (quote_list.length < 1) func.throwErrorWithMissingParam('NO QUOTE FOUND');

            const {vn_customer_id: customer_id, realm_id: customer_realm_id, name: contact_name, cell: contact_cell} =
                await new VNCustomer(customer_token).findInstanceDetailWithToken(['realm_id', 'name', 'cell']);


            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');

            const orderObj = new VNOrder();
            const {order_id, order_token} = await orderObj.registerOrder(
                {type: 4, lord_id, customer_id, contact_name, contact_cell, note}, realm_id
            );


            const trip_promise_list = quote_list.map(quote_info => {
                const {quote_token, flight_str} = quote_info;

                return new Promise((resolve, reject) => {
                    const quoteObj = new VNQuote(quote_token);
                    quoteObj.findFullQuoteWithToken(realm_id)
                        .then(info => {
                            const tripObj = new VNTrip();

                            return tripObj.registerTrip({...info, flight_str}, customer_id, order_id, realm_id);
                        })
                        .then(trip_info => resolve(trip_info.trip_token))
                        .catch(err => reject(err));
                });

            });

            const trip_list = await Promise.all(trip_promise_list);

            return {order_token, trip_list};

        } catch (e) {
            throw e;
        }
    }

    static async findOrderDetail(params, body, query) {
        try {
            const {realm_token, order_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);

            const {vn_order_id: order_id, realm_id: auth_realm_id} = await orderObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== auth_realm_id) func.throwError('REALM NOT MATCH');

            const {customer_id, ...order_info} = await orderObj.findOrderFullDetail();

            const customerObj = new VNCustomer(null, customer_id);

            const customer_info = await customerObj.findCustomerDetail(realm_id);

            const {record_list: trip_list} = await VNTrip.findTripListInOrder(realm_id, order_id);

            const {record_list: addon_list} = await VNAddon.findAddonListInOrder(order_id, realm_id);

            const {record_list: order_discount_list} = await VNOrderDiscount.findOrderDiscountListWithOrder(order_id, realm_id);

            const {record_list: order_note_list} = await VNOrderNote.findOrderNoteListWithOrder({start: 0}, realm_id, order_id);


            return {order_info, trip_list, customer_info, addon_list, order_discount_list, order_note_list};
        } catch (e) {
            throw e;
        }
    }

    static async modifyOrderDetail(params, body, query) {
        try {

            const {realm_token, order_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);


            const orderObj = new VNOrder(order_token);

            const {realm_id: order_realm_id} = await orderObj.findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');

            await orderObj.modifyInstanceDetailWithId(body, ['status', 'contact_name', 'contact_cell', 'note']);

            return {order_token};
        } catch (e) {
            throw e;
        }
    }

    static async findOrderListInRealm(params, body, query) {
        try {
            const {realm_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            return await VNOrder.findOrderListInRealm(query, realm_id);
        } catch (e) {
            throw e;
        }
    }

    static async findOrderListWithCustomer(params, body, query) {
        try {
            const {realm_token, customer_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {realm_id: customer_realm_id, vn_customer_id: customer_id} = await new VNCustomer(customer_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== customer_realm_id) func.throwError('REALM_ID NOT MATCH');


            return await VNOrder.findOrderListWithCustomer(query, realm_id, customer_id);


        } catch (e) {
            throw e;
        }
    }

    static async modifyOrderDiscountItem(params, body, query) {
        try {

            const {realm_token, order_token, order_discount_token} = params;

            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const {vn_order_id: order_id, realm_id: order_realm_id, status} =
                await new VNOrder(order_token).findInstanceDetailWithToken(['realm_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');

            if (status >= 2) func.throwError('ORDER HAS BEEN FINALIZED');

            const orderDiscountObj = new VNOrderDiscount(order_discount_token);


            const {order_id: discount_order_id, realm_id: discount_realm_id} = await orderDiscountObj.findInstanceDetailWithToken(
                ['order_id', 'realm_id']
            );

            if (realm_id !== discount_realm_id) func.throwError('REALM NOT MATCH');

            if (order_id !== discount_order_id) func.throwError('ORDER NOT MATCH');

            await orderDiscountObj.modifyInstanceDetailWithId(body, ['status']);


            return {order_discount_token};
        } catch (e) {
            throw e;
        }
    }

    static async registerOrderDiscountInOrder(params, body, query) {
        try {
            const {realm_token, order_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);
            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await orderObj.findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');


            const {code} = body;

            const {amount} = await VNOrder.findOrderFinalPrice(order_id, realm_id);

            const {discount_id, available_usage, min_price, vdate} = await new VNDiscount().findDiscountInfoWithKey(code, realm_id);

            if (amount < min_price) func.throwError('AMOUNT TOO LOW TO USE THIS COUPON');

            if (utility.compareEarlier(vdate, new Date())) func.throwError('COUPON EXPIRED');
            if (available_usage < 1) func.throwError('NOT ENOUGH AVAILABLE USAGE');
            const {order_discount_token} =
                await new VNOrderDiscount().registerOrderDiscount(order_id, customer_id, realm_id, discount_id);

            return {order_discount_token};

        } catch (e) {
            throw e;

        }
    }

    static async finalizeOrder(params, body, query) {
        try {

            const {realm_token, order_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);
            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await orderObj.findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');


            const {record_list: trip_list} = await VNTrip.findTripListInOrder(realm_id, order_id);

            const {record_list: addon_list} = await VNAddon.findAddonListInOrder(order_id, realm_id);

            const {record_list: order_discount_list} = await VNOrderDiscount.findOrderDiscountListWithOrder(order_id, realm_id);

            let trip_sum = 0;
            if (trip_list) {
                trip_sum = trip_list.reduce((acc, curr) => acc + curr.amount, 0);
            }

            let addon_sum = 0;
            if (addon_list) {
                addon_sum = addon_list.reduce((acc, curr) => acc + curr.amount, 0);
            }

            let final_total = trip_sum + addon_sum;
            if (order_discount_list) {
                final_total = order_discount_list.reduce((acc, curr) => {
                    const {rate, amount, type} = curr;

                    if (type === 1) return acc - amount;
                    if (type === 2) return acc * (1 - (rate / 1000));

                }, (trip_sum + addon_sum));
            }

            const {coin_token, coin_id} = await new VNCoin().registerCoin(final_total);

            await orderObj.modifyInstanceDetailWithId({coin_id, status: 2}, ['coin_id', 'status']);


            const {lord_token} = query;
            let lord_name = 'N/A';
            if (lord_token) {
                const {name} = await new VNLord(lord_token).findInstanceDetailWithToken(['name']);
                lord_name = name;
            } else {
                lord_name = null;
            }

            const note = `Order Finalize By ${lord_name || 'Customer'} - Amount: $ ${(final_total / 100).toFixed(2)} - ${order_token} `;
            await new VNOrderNote().registerOrderNote({note, type: 2}, realm_id, customer_id, order_id);

            return {coin_token, order_token, final_total};

        } catch (e) {
            throw e;
        }
    }

    static async makeOrderPayment(params, body, query) {

        try {

            const {realm_token, order_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);
            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await orderObj.findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');

            const {receipt, type} = body;

            if (type === 1 && receipt) {
                await orderObj.paidOrderTrips(receipt);
            }

            if (type === 2 || type === 3 || type === 4) {
                await orderObj.modifyInstanceDetailWithId({type, receipt}, ['type', 'receipt']);
            }

            const {lord_token} = query;
            let lord_name = 'N/A';
            if (lord_token) {
                const {name} = await new VNLord(lord_token).findInstanceDetailWithToken(['name']);
                lord_name = name;
            }

            const note = `Registered Payment - ${type === 1 ? ('Receipt: ' + receipt) : 'None Prepay'} By ${lord_name || 'Customer'} 
            -  ${order_token}`;
            await new VNOrderNote().registerOrderNote({note, type: 2}, realm_id, customer_id, order_id);

            return {order_token};

        } catch (e) {
            throw e;
        }
    }

    static async makeOrderConfirmed(params, body, query) {
        try {

            const {realm_token, order_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);
            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await orderObj.findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');

            await orderObj.confirmOrderStatus();

            const {record_list: order_discount_list} = await VNOrderDiscount.findOrderDiscountListWithOrder(order_id, realm_id);

            const promise_list = order_discount_list.map(order_discount => {

                return new Promise((resolve, reject) => {

                    const {available_usage, discount_token} = order_discount;

                    const discountObj = new VNDiscount(discount_token);

                    discountObj.modifyInstanceDetailWithToken(
                        {available_usage: ((available_usage - 1) > 0 ? (available_usage - 1) : 0)},
                        ['available_usage'])
                        .then(resolve)
                        .catch(reject);

                });

            });

            await Promise.all(promise_list);

            const tributeObj = new VNTribute();

            const rate = await VNRealm.findTributeRateWithRealm(realm_id);

            const order_amount = await VNOrder.findOrderFinalPrice(order_id, realm_id);

            const tribute_amount = Math.ceil(order_amount * rate / 1000);

            const {coin_id} = await new VNCoin().registerCoin(tribute_amount);

            const {tribute_token} = await tributeObj.registerTributeDetail(
                {
                    note: 'ORDER INCOME'
                }, realm_id, coin_id, order_id);

            const {lord_token} = query;
            let lord_name = 'N/A';
            if (lord_token) {
                const {name} = await new VNLord(lord_token).findInstanceDetailWithToken(['name']);
                lord_name = name;
            }

            const note = `Order Confirmed By ${lord_name} - ${order_token}`;
            await new VNOrderNote().registerOrderNote({note, type: 2}, realm_id, customer_id, order_id);

            return {order_token, tribute_token};

        } catch (e) {
            throw e;
        }
    }

    static async makeOrderCanceled(params, body, query) {
        try {

            const {realm_token, order_token} = params;
            const {realm_id} = await this.findRealmIdWithToken(realm_token);

            const orderObj = new VNOrder(order_token);

            const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
                await orderObj.findInstanceDetailWithToken(['realm_id', 'customer_id']);

            if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');


            const {lord_token} = query;
            let lord_name = 'N/A';
            if (lord_token) {
                const {name} = await new VNLord(lord_token).findInstanceDetailWithToken(['name']);
                lord_name = name;
            }

            const note = `Order Canceled By ${lord_name} - ${order_token}`;

            const promise_list = [
                orderObj.cancelOrderStatus(),
                VNWage.cancelWageInOrder(order_id, realm_id),
                VNTribute.cancelTributeWithOrder(order_id, realm_id),
                new VNOrderNote().registerOrderNote({note, type: 2}, realm_id, customer_id, order_id)
            ];

            await Promise.all(promise_list);

            return {order_token};

        } catch (e) {
            throw e;
        }
    }


    // static async registerAddonInOrder(params, body, query) {
    //
    //     try {
    //         const {realm_token, order_token} = params;
    //
    //         const {realm_id} = await this.findRealmIdWithToken(realm_token);
    //
    //
    //         const {vn_order_id: order_id, realm_id: order_realm_id, customer_id} =
    //             await new VNOrder(order_token).findInstanceDetailWithToken(['realm_id', 'customer_id']);
    //
    //
    //         if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');
    //
    //         const {addon_token} = await new VNAddon().registerAddon(
    //             body,
    //         )
    //
    //     } catch (e) {
    //         throw e;
    //     }
    //
    //
    // }

    static async modifyAddonInOrder(params, body, query) {

    }


    // static async modifyOrderDiscount(params, body, query) {
    //     try {
    //         const {realm_token, order_token, order_discount_token} = params;
    //         const {realm_id} = await this.findRealmIdWithToken(realm_token);
    //
    //         const {vn_order_id: order_id, realm_id: order_realm_id} =
    //             await new VNOrder(order_token).findInstanceDetailWithToken(['realm_id']);
    //
    //         if (realm_id !== order_realm_id) func.throwError('REALM NOT MATCH');
    //
    //
    //         const orderDiscountObj = new VNOrderDiscount(order_discount_token);
    //         const {order_id: auth_order_id, realm_id: discount_realm_id} =
    //             await orderDiscountObj.findInstanceDetailWithToken([
    //                 'order_id', 'realm_id'
    //             ]);
    //
    //         if (order_id !== auth_order_id) func.throwError('ORDER_ID NOT MATCH');
    //         if (realm_id !== discount_realm_id) func.throwError('REALM_ID NOT MATCH');
    //
    //         await orderDiscountObj.modifyInstanceDetailWithId(body, ['status']);
    //         return {order_discount_token};
    //     } catch (e) {
    //         throw e;
    //     }
    // }


}

module.exports = VNOrderAction;