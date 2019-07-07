const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');


const func = require('od-utility');


class VNCoin extends ODInstance {


    constructor(coin_token, coin_id) {
        super('vn_coin', 'coin_token', coin_token, coin_id);
    }


    async registerCoin(amount) {
        if (!amount) func.throwErrorWithMissingParam('amount');

        try {
            this.instance_id = await this.insertInstance(
                {amount, cdate: 'npw()', udate: 'now()', status: 0}
            );

            this.instance_token = `COIN-${func.encodeUnify(this.instance_id, 'coin')}`;

            await this.updateInstance({coin_token: this.instance_token});

            return {coin_token: this.instance_token, coin_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNCoin;