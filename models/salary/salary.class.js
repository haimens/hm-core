const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');
const func = require('od-utility');

class VNSalary extends ODInstance {
    constructor(salary_token, salary_id) {
        super('vn_salary', 'salary_token', salary_token, salary_id);
    }

    async registerSalary(info = {}, realm_id, driver_id) {
        try {

        } catch (e) {
            throw e;
        }
    }

    static async findSalaryListInRealm(search_query = {}, realm_id) {
        try {
        } catch (e) {
            throw e;
        }
    }

    static async findSalaryListWithDriver(search_query = {}, realm_id, driver_id) {

        try {
        } catch (e) {
            throw e;
        }
    }

    static async findSalarySumWithDriver(search_query = {}, realm_id, driver_id) {
        try {
        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNSalary;