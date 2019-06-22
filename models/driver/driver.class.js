const ODInstance = require('../instance.model');
const func = require('od-utility');
const HNApp = require('@odinternational/od-havana-conn');

class VNDriver extends ODInstance {
    constructor(driver_token, driver_id) {
        super('vn_driver', 'driver_token', driver_token, driver_id);
    }

    static async findDriverWithInfo(username) {
        if (!username) func.throwErrorWithMissingParam('username');
        try {
            const query = `
                SELECT id as driver_id, driver_token
                FROM vn_driver
                WHERE username = '${username}'
                AND (status = 2 OR status = 1)
                LIMIT 0,1
            `;

            const [record] = await this.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }

    async registerDriver(driver_info = {}, realm_id) {
        if (!driver_info) func.throwErrorWithMissingParam('driver_info');

        const {name, cell, email, username, img_path, license_num, identifier} = driver_info;
        if (!name) func.throwErrorWithMissingParam('name');
        if (!cell) func.throwErrorWithMissingParam('cell');
        if (!email) func.throwErrorWithMissingParam('email');
        if (!username) func.throwErrorWithMissingParam('username');

        if (!license_num) func.throwErrorWithMissingParam('license_num');
        if (!identifier) func.throwErrorWithMissingParam('identifier');


        if (!realm_id) func.throwErrorWithMissingParam('realm_id');


        try {
            const driverApp = new HNApp(process.env.DRIVER_APP_TOKEN, process.env.DRIVER_APP_KEY);

            const {is_exist} = await driverApp.checkUsernameExist(username);
            if (is_exist) func.throwError('USERNAME HAS BEEN TAKEN', 402);

            const name_parts = name.split(' ');
            const first_name = name_parts[0], last_name = name_parts.pop();

            let avatar = img_path;
            if (!img_path) {
                const {image_path} = await driverApp.findRandomImageWithService('avatar');
                avatar = image_path;
            }


            const {instance_token: driver_key} = await driverApp.signupUserInstance(
                username, username, email, first_name, last_name, cell
            );

            this.instance_id = await this.insertInstance({
                name,
                cell,
                email,
                username,
                driver_key,
                cdate: 'now()',
                udate: 'now()',
                realm_id,
                license_num,
                identifier,
                img_path: avatar,
                status: 1
            });

            this.instance_token = `DRV-${func.encodeUnify(this.instance_id, 'drv')}`;

            await this.updateInstance({driver_token: this.instance_token, username, status: 2});

            return {driver_id: this.instance_id, driver_token: this.instance_token, username, name};
        } catch (err) {
            throw err;
        }
    }

    static async findDriverTokenWithKey(driver_key) {
        if (!driver_key) func.throwErrorWithMissingParam('driver_key');

        try {
            const query = `
                SELECT driver_token
                FROM vn_driver
                WHERE driver_key = '${driver_key}'
                LIMIT 0,1
            `;

            const [record] = await VNDriver.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNDriver;