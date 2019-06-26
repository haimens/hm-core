const flightStats = require('od-flight-stats');
const func = require('od-utility');


class VNFlightStats {

    constructor() {
        this.api = new flightStats(process.env.FLIGHT_APPLICATION_ID, process.env.FLIGHT_APPLICATION_KEY);
    }

    async lookUp(options) {
        try {

            const {airlineCode, flightNumber, date} = options;
            if (!airlineCode) func.throwErrorWithMissingParam('airlineCode');
            if (!flightNumber) func.throwErrorWithMissingParam('flightNumber');
            if (!date) func.throwErrorWithMissingParam('date');
            const result = await this.api.lookUp(options);

            const {flightStatuses} = result;

            if (!flightStatuses) func.throwError('CANNOT FIND RESULT');

            if (flightStatuses.length < 1) func.throwError('CANNOT FIND FLIGHT WITH GIVEN CONDITION');


            const flight_list = flightStatuses.map(rawFlight => {
                const {
                    flightId, carrierFsCode, flightNumber,
                    departureAirportFsCode, arrivalAirportFsCode, departureDate,
                    arrivalDate, airportResources
                } = rawFlight;
                const flight_key = flightId;
                const dep_date = departureDate.dateUtc;
                const arr_date = arrivalDate.dateUtc;

                const carrier_code = carrierFsCode;
                const flight_num = flightNumber;
                const dep_airport = departureAirportFsCode;
                const arr_airport = arrivalAirportFsCode;

                const dep_terminal = airportResources.departureTerminal;
                const arr_terminal = airportResources.arrivalTerminal;

                return {
                    flight_key,
                    dep_date,
                    arr_date,
                    carrier_code,
                    flight_num,
                    dep_airport,
                    arr_airport,
                    dep_terminal,
                    arr_terminal
                }
            });

            return {flight_list};
        } catch (e) {
            throw e;
        }
    }
}


module.exports = VNFlightStats;