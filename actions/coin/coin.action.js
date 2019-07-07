const func = require('od-utility');
const VNAction = require('../action.model');

const VNCoin = require('../../models/coin/coin.class');


class VNCoinAction extends VNAction {

    static async registerCoinDetail(params, body, query) {
        try {
            const {amount} = body;
            if (!amount) func.throwErrorWithMissingParam('amount');
            const {coin_token} = await new VNCoin().registerCoin(amount);

            return {coin_token};
        } catch (e) {
            throw e;
        }
    }

}

module.exports = VNCoinAction;