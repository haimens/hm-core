const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
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

    static async findDriverListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {date_from, date_to, from_key, to_key, keywords, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_driver',
                    ['name', 'cell', 'email', 'identifier', 'img_path', 'license_num', 'username', 'status', 'driver_token', 'rate'])
                .configComplexConditionQueryItem('vn_driver', 'realm_id', realm_id)
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_driver')
                .configStatusCondition(status, 'vn_driver')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_driver')
                .configKeywordCondition(['name', 'cell', 'email', 'username', 'license_num'], keywords, 'vn_driver')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_driver', conditions);
            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_driver', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch (e) {
            throw e;
        }
    }

    static async findDriverLocationListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {

            const {keywords, start, status} = search_query;

            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys('vn_driver',
                    ['name', 'cell', 'email', 'img_path', 'license_num', 'username', 'driver_token']
                )
                .configComplexConditionKeys('location_info', ['lat', 'lng', 'udate AS location_udate', 'driver_location_token'])
                .configSimpleJoin(`LEFT JOIN (
                    SELECT * FROM ( 
                        SELECT vn_driver_location.lat, vn_driver_location.lng, vn_driver_location.cdate, 
                        vn_driver_location.driver_location_token,
                        vn_driver_location.udate, vn_driver_location.driver_id
                        FROM vn_driver_location 
                        WHERE vn_driver_location.realm_id = ${realm_id}  
                        AND vn_driver_location.status = 1 
                        ORDER BY vn_driver_location.udate DESC 
                    ) AS sub
                    
                    
                    GROUP BY sub.driver_id 
                    
                ) AS location_info ON vn_driver.id = location_info.driver_id `)
                .configComplexConditionQueryItem('vn_driver', 'realm_id', realm_id)
                .configStatusCondition(status, 'vn_driver')
                .configComplexConditionQueryItem('location_info', 'lat', 'NULL', 'IS NOT')
                .configKeywordCondition(['name', 'cell', 'email', 'license_num'], keywords, 'vn_driver')
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_driver', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_driver', conditions);
            console.log(record_list);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};
        } catch
            (e) {
            throw e;
        }
    }


    static async findDriverPayableListInRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        try {
            const {start} = search_query;

            // const query = `
            //
            //     SELECT IFNULL((wage_in_info.total - wage_out_info.total - salary_info.total),0) AS payable,
            //     vn_driver.driver_token, vn_driver.name, vn_driver.username, vn_driver.cell,
            //     vn_driver.email, vn_driver.img_path
            //     FROM vn_driver
            //
            //     LEFT JOIN (
            //         SELECT SUM(vn_coin.amount) AS total , vn_wage.driver_id
            //         FROM vn_wage
            //         LEFT JOIN vn_coin ON vn_wage.coin_id = vn_coin.id
            //         WHERE vn_wage.realm_id = ${realm_id}
            //         AND vn_wage.status = 1
            //         AND vn_wage.type = 1
            //         GROUP BY vn_wage.driver_id
            //     ) AS wage_in_info ON wage_in_info.driver_id = vn_driver.id
            //
            //     LEFT JOIN (
            //         SELECT SUM(vn_coin.amount) AS total , vn_wage.driver_id
            //         FROM vn_wage
            //         LEFT JOIN vn_coin ON vn_wage.coin_id = vn_coin.id
            //         WHERE vn_wage.realm_id = ${realm_id}
            //         AND vn_wage.status = 1
            //         AND vn_wage.type = 2
            //         GROUP BY vn_wage.driver_id
            //     ) AS wage_out_info ON wage_out_info.driver_id = vn_driver.id
            //
            //     LEFT JOIN (
            //         SELECT SUM(vn_coin.amount) AS total , vn_salary.driver_id
            //         FROM vn_salary
            //         LEFT JOIN vn_coin ON vn_salary.coin_id = vn_coin.id
            //         WHERE vn_salary.realm_id = ${realm_id}
            //         AND vn_salary.status = 1
            //         GROUP BY vn_salary.driver_id
            //     ) AS salary_info ON salary_info.driver_id = vn_driver.id
            //
            //     WHERE vn_driver.realm_id = ${realm_id}
            //     AND vn_driver.status = 2
            //     AND IFNULL((wage_in_info.total - wage_out_info.total - salary_info.total),0) > 0
            //
            //     ORDER BY payable DESC
            //
            //     LIMIT ${parseInt(start) || 0}, 30
            //
            // `;

            const conditions = new ODCondition();

            conditions
                .configComplexSimpleKey(`IFNULL((wage_in_info.total - wage_out_info.total - salary_info.total),0) AS payable`)
                .configComplexConditionKeys('vn_driver', ['driver_token', 'name', 'cell', 'email', 'username', 'img_path'])
                .configSimpleJoin(`LEFT JOIN (
                    SELECT SUM(vn_coin.amount) AS total , vn_salary.driver_id
                    FROM vn_salary 
                    LEFT JOIN vn_coin ON vn_salary.coin_id = vn_coin.id 
                    WHERE vn_salary.realm_id = ${realm_id} 
                    AND vn_salary.status = 1 
                    GROUP BY vn_salary.driver_id 
                ) AS salary_info ON salary_info.driver_id = vn_driver.id `)
                .configSimpleJoin(`LEFT JOIN (
                    SELECT SUM(vn_coin.amount) AS total , vn_wage.driver_id 
                    FROM vn_wage 
                    LEFT JOIN vn_coin ON vn_wage.coin_id = vn_coin.id 
                    WHERE vn_wage.realm_id = ${realm_id} 
                    AND vn_wage.status = 1 
                    AND vn_wage.type = 2 
                    GROUP BY vn_wage.driver_id 
                ) AS wage_out_info ON wage_out_info.driver_id = vn_driver.id `)
                .configSimpleJoin(`LEFT JOIN (
                    SELECT SUM(vn_coin.amount) AS total , vn_wage.driver_id 
                    FROM vn_wage 
                    LEFT JOIN vn_coin ON vn_wage.coin_id = vn_coin.id 
                    WHERE vn_wage.realm_id = ${realm_id} 
                    AND vn_wage.status = 1 
                    AND vn_wage.type = 1 
                    GROUP BY vn_wage.driver_id 
                ) AS wage_in_info ON wage_in_info.driver_id = vn_driver.id `)
                .configComplexConditionQueryItem('vn_driver', 'realm_id', realm_id)
                .configStatusCondition(2, 'vn_driver')
                .configSimpleOrder('payable DESC')
                .configSimpleCondition(`IFNULL((wage_in_info.total - wage_out_info.total - salary_info.total),0) > 0 `)
                .configQueryLimit(start, 30);


            const count = await this.findCountOfInstance('vn_driver', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_driver', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length};


        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNDriver;