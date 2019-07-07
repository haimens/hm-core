const dotenv = require('dotenv');
dotenv.config();


const VNQuote = require('../actions/quote/quote.action');


async function testPriceQuote(from_address_str, to_address_str, pickup_time,pickup_time_local) {
    try {
        const result = await VNQuote.findPriceQuoteWithAddress(
            {realm_token: 'REALM-e775d5ca14bd440e244ea374c1f57fc5'},
            {
                from_address_str,
                to_address_str,
                pickup_time,
                pickup_time_local
            }, {});

        console.log(result);
    } catch (e) {
        console.log(e);
    }
}


testPriceQuote('3629 Lynoak Dr, Chino Hills', 'LAX International Airport', '2019-06-30 14:56:00','2019-06-30 22:56:00');