const func = require('od-utility');
const VNAction = require('../action.model');
const VNRealm = require('../../models/realm/realm.class');
const VNAddress = require('../../models/address/address.class');
const VNGoogleMap = require('../../models/address/google.class');

const VNSetting = require('../../models/setting/setting.class');
const VNCarType = require('../../models/car/car.type');
const VNQuote = require('../../models/quote/quote.class');

class VNQuoteAction extends VNAction {

    static async findPriceQuoteWithAddress(params, body, query) {
        try {
            const {realm_token} = params;

            if (!realm_token) func.throwErrorWithMissingParam('realm_token');

            const realmObj = new VNRealm(realm_token);

            const {vn_realm_id: realm_id} = await realmObj.findInstanceDetailWithToken();

            const {from_address_str, to_address_str, pickup_time} = body;

            const address_results = await Promise.all(
                [VNGoogleMap.findFormattedAddress(from_address_str), VNGoogleMap.findFormattedAddress(to_address_str)]
            );

            const from_address_info = address_results[0];
            const to_address_info = address_results[1];

            const {addr_str: from_formatted, lat: from_lat, lng: from_lng} = from_address_info;
            const {addr_str: to_formatted, lat: to_lat, lng: to_lng} = to_address_info;

            const matrix_info = await VNGoogleMap.findDistanceMatrix(from_formatted, to_formatted, pickup_time);

            const {distance, duration} = matrix_info;

            const {value: distance_value, text: distance_text} = distance;

            const {value: duration_value, text: duration_text} = duration;


            const equation_results = await Promise.all(
                [
                    VNSetting.findSettingInfoWithKey(realm_id, 'price_base'),
                    VNSetting.findSettingInfoWithKey(realm_id, 'price_mile'),
                    VNSetting.findSettingInfoWithKey(realm_id, 'price_minute'),
                    VNCarType.findAllCarTypeInRealm(realm_id),
                    new VNAddress().registerAddress(from_address_info),
                    new VNAddress().registerAddress(to_address_info)
                ]
            );

            const price_base = equation_results[0].value;
            const price_mile = equation_results[1].value;
            const price_minute = equation_results[2].value;

            const {record_list: car_type_list} = equation_results[3];

            const {address_id: from_address_id} = equation_results[4];
            const {address_id: to_address_id} = equation_results[5];

            const quote_raw_list = car_type_list.map(car_type_info => {
                const {price_prefix, name: car_type_name, car_type_id, img_path, max_capacity} = car_type_info;
                const amount = VNQuote.givePriceQuote(price_base, price_mile, price_minute, distance_value, duration_value, price_prefix);
                return {
                    amount,
                    car_type_name,
                    car_type_id,
                    img_path,
                    max_capacity
                }
            });

            const quote_promise_list = quote_raw_list.map(raw_info => {
                return new Promise((resolve, reject) => {
                    const quoteObj = new VNQuote();
                    const {amount, car_type_id, img_path, car_type_name, max_capacity} = raw_info;
                    quoteObj.registerQuote(amount, realm_id, car_type_id, from_address_id, to_address_id, pickup_time)
                        .then(quote_result => {
                            const {quote_token} = quote_result;
                            resolve({
                                quote_token, img_path, car_type_name, amount, max_capacity
                            })
                        })
                        .catch(err => reject(err));
                });
            });

            const basic_info = {
                distance_text, duration_text
                , distance_value, duration_value, from_lat, from_lng, to_lat, to_lng,
                price_base, price_mile, price_minute,
                pickup_time, from_formatted, to_formatted

            };
            const quote_list = await Promise.all(quote_promise_list);

            return {basic_info, quote_list};
            // const fromAddrObj = new VNAddress();
            // const toAddrObj = new VNAddress();
            // const local_addresses = await Promise.all()


        } catch (e) {
            throw e;
        }
    }

}


module.exports = VNQuoteAction;