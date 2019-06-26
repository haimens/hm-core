const dotenv = require('dotenv');
dotenv.config();

const VNFlightStats = require('../models/flight/fstats.class');


async function testFlightLookup(airlineCode, flightNumber, date) {
    try {

        const flightSearch = new VNFlightStats();

        const result  = await flightSearch.lookUp({airlineCode, flightNumber, date});

        console.log(result)

    } catch (e) {
        throw e;
    }
}

testFlightLookup('AA', '100', '2019-06-25 10:00:00');