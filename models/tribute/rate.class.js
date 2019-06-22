const ODInstance = require('../instance.model');
const func = require('od-utility');


class VNTributeRate extends ODInstance {

    constructor(tribute_rate_token, tribute_rate_id) {
        super('vn_tribute_rate', 'tribute_rate_token', tribute_rate_token, tribute_rate_id);
    }

    async registerTributeRate(rate) {
        if (!rate) func.throwErrorWithMissingParam('rate');

        try {
            if (rate > 900) func.throwError('RATE TOO HIGH');
            if (rate < 1) func.throwError('RATE TOO LOW');

            const exist_flag = await VNTributeRate._findTributeRateWithRate(rate);
            if (exist_flag) {
                const {status, tribute_rate_id, tribute_rate_token} = exist_flag;
                if (status !== 1) {
                    this.instance_id = tribute_rate_id;
                    await this.updateInstance({status: 1});
                }
                return {tribute_rate_id, tribute_rate_token}
            }

            this.instance_id = await this.insertInstance({
                rate, cdate: 'now()', udate: 'now()', status: 0
            });
            this.instance_token = `TRBR-${func.encodeUnify(this.instance_id, 'trb-rt')}`;
            await this.updateInstance({tribute_rate_token: this.instance_token, status: 1});

            return {tribute_rate_id: this.instance_id, tribute_rate_token: this.instance_token};

        } catch (e) {
            throw e;
        }


    }

    static async _findTributeRateWithRate(rate) {
        if (!rate) func.throwErrorWithMissingParam('rate');
        try {
            const query = `SELECT id AS tribute_rate_id, 
                tribute_rate_token, status 
                FROM vn_tribute_rate 
                WHERE rate = ${rate} 
                LIMIT 0, 1
            `;

            const [record] = await this.performQuery(query);
            return record;
        } catch (e) {
            throw e;
        }
    }


}

module.exports = VNTributeRate;