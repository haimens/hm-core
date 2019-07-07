const dotenv = require('dotenv');
dotenv.config();

const VNQuoteAction = require('../actions/quote/quote.action');
const VNOrderAction = require('../actions/order/order.action');


(async (from_address_str, to_address_str, pickup_time, pickup_time_local, customer_token) => {
    try {
        const result = await VNQuoteAction.findPriceQuoteWithAddress(
            {realm_token: 'REALM-3ec72d3a5be4deb52333787fceefec19'},
            {
                from_address_str,
                to_address_str,
                pickup_time,
                pickup_time_local
            }, {});

        const {quote_token} = result.quote_list[0];

        const order_result = await VNOrderAction.registerOrder(
            {realm_token: 'REALM-3ec72d3a5be4deb52333787fceefec19'},
            {customer_token, type: 1, quote_list: [quote_token]},
            {}
        );

        console.log(order_result);
        console.log(result);
    } catch (e) {
        console.log(e);
    }
})('3629 Lynoak Dr, Chino Hills', 'LAX International Airport', '2019-07-03 14:56:00',
    '2019-07-03 22:56:00', 'CTM-a4e701c3aaf638e840b9baea8f0dcd1e');

//
// (async (order_token, realm_token) => {
//     try {
//         const result = await VNOrderAction.findOrderDetail(
//             {order_token, realm_token}, {}, {}
//         );
//         console.log(result)
//     } catch (e) {
//         console.log(e);
//     }
// })('ORD-48052aba3ff512156a2a54443e420372', 'REALM-3ec72d3a5be4deb52333787fceefec19');