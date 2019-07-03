const moment = require('moment');
const googleMapsClient = require('@google/maps').createClient({key: process.env.GOOGLE_API_KEY});

class VNGoogleMap {

    static async findFormattedAddress(address) {
        return new Promise((resolve, reject) => {

            if (!address) reject('CANNOT FIND ADDRESS');

            googleMapsClient.geocode({address: address}, (err, response) => {
                    if (!err) {
                        const results = response.json.results;
                        if (results.length < 1) reject(new Error('CANNOT FIND RELATED ADDRESS FROM GOOGLE'));
                        const [{address_components, formatted_address, geometry}] = results;

                        let city='', state='', zip='', street_line_2;
                        let street_number = '', route = '';
                        let lat, lng;

                        address_components.forEach(component => {
                            const {types, long_name, short_name} = component;

                            if (types.includes('street_number')) {
                                street_number = long_name;
                            }

                            if (types.includes('route')) {
                                route = short_name;
                            }

                            if (types.includes('locality')) {
                                city = long_name;
                            }

                            if (types.includes('administrative_area_level_1')) {
                                state = short_name;
                            }

                            if (types.includes('postal_code')) {
                                zip = long_name;
                            }
                            if (types.includes('subpremise')) {
                                street_line_2 = `#${short_name}`;
                            }
                        });

                        const {location} = geometry;

                        if (location) {
                            lat = location.lat;
                            lng = location.lng;
                        }
                        const street_line_1 = `${street_number} ${route}`;


                        const address_info = {
                            city, state, zip, street_line_1, street_line_2: street_line_2 || '',
                            lat, lng, addr_str: formatted_address
                        };

                        resolve(address_info);

                    } else {

                        reject(err);
                    }
                }
            );
        });
    }

    static async findDistanceMatrix(addr_from, addr_to, pickup_time) {
        return new Promise((resolve, reject) => {
            const future_time = moment.utc(pickup_time).valueOf();
            googleMapsClient.distanceMatrix(
                {
                    origins: [addr_from],
                    destinations: [addr_to],
                    departure_time: future_time
                }, (err, response) => {
                    if (err) reject(err);
                    const {rows} = response.json;

                    if (!response.json) reject(new Error('CANNOT FIND DISTANCE MATRIX'));

                    const {destination_addresses, origin_addresses} = response.json;

                    if (!rows[0].elements) reject('CANNOT FIND DISTANCE MATRIX ELEMENTS');
                    const [info] = rows[0].elements;


                    const matrix_info = {
                        from_addr_str: origin_addresses[0],
                        to_addr_str: destination_addresses[0],
                        pickup_time: pickup_time,
                        distance: info.distance,
                        duration: info.duration_in_traffic

                    };
                    resolve(matrix_info);
                });
        });
    }
}

module.exports = VNGoogleMap;