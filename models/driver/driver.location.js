const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');

const func = require('od-utility');

class VNDriverLocation extends ODInstance {


    constructor(driver_location_token, driver_location_id) {
        super('vn_driver_location', 'driver_location_token', driver_location_token, driver_location_id);
    }

    async registerDriverLocation(info = {}, realm_id, driver_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');
        try {
            const {lat, lng} = info;

            this.instance_id = await this.insertInstance(
                {
                    lat, lng, cdate: 'now()', udate: 'now()',
                    driver_id, realm_id,
                    status: 0
                }
            );

            this.instance_token = `DLR-${func.encodeUnify(this.instance_id, 'dlr')}`;

            await this.updateInstance({driver_location_token: this.instance_token, status: 1});

            return {driver_location_token: this.instance_token, driver_location_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findDriverLocationWithDriver(driver_id, realm_id) {
        if (!driver_id) func.throwErrorWithMissingParam('driver_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_driver_location',
                    ['lat', 'lng', 'cdate', 'udate']
                )
                .configComplexConditionQueryItem(
                    'vn_driver_location',
                    'driver_id', driver_id
                )
                .configComplexConditionQueryItem(
                    'vn_driver_location',
                    'realm_id', realm_id
                )
                .configStatusCondition(1, 'vn_driver_location')
                .configComplexOrder('cdate', 'DESC', ['cdate'], 'vn_driver_location')
                .configQueryLimit(0, 1);


            const [record] = await VNDriverLocation.findInstanceListWithComplexCondition('vn_driver_location', conditions);

            return record;
        } catch (e) {
            throw e;
        }
    }



}

module.exports = VNDriverLocation;