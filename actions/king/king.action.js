const func = require('od-utility');
const VNAction = require('../action.model');
const VNKing = require('../../models/king/king.class');
const redis = require('od-utility-redis');

class VNKingAction extends VNAction {
    static async checkKingWithKey(params, body, query) {
        const {king_key} = params;
        if (!king_key) func.throwErrorWithMissingParam('king_key');

        try {
            const king_detail = await redis.getAsync('KING-CHECK', king_key);
            if (king_detail) return king_detail;

            const {king_token} = await VNKing.findKingTokenWithKey(king_key);
            if (!king_token) func.throwError('This user is not registered in this system');

            const kingObj = new VNKing(king_token);
            const {king_status, vn_king_id, ...king_info} = await kingObj.findInstanceDetailWithToken([
                'name', 'cell', 'email', 'username', 'cdate', 'udate', 'king_key', 'status AS king_status', 'king_token'
            ]);

            if (king_status !== 2) return {isValid: false, message: 'KING SUSPENDED'};

            const response = {isValid: true, ...king_info};

            await redis.setAsync('KING-CHECK', king_key, response);

            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNKingAction;