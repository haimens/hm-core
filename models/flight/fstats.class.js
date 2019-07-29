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

            if (!flightStatuses) return {flight_list: []};

            if (flightStatuses.length < 1) return {flight_list: []};


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
            console.log('FLIGHT STATUS: ', e);
            return {flight_list: []};
        }
    }

    async findFlight(flight_key) {
        try {
            if (!flight_key) func.throwErrorWithMissingParam('flight_key');
            const result = await this.api.findFlight(flight_key);

            const {flightStatus} = result;

            const {
                flightId, carrierFsCode, flightNumber,
                departureAirportFsCode, arrivalAirportFsCode, departureDate,
                arrivalDate, airportResources
            } = flightStatus;
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
        } catch (e) {
            throw e;
        }

    }
}


module.exports = VNFlightStats;