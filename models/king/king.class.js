const ODInstance = require('../instance.model');
const func = require('od-utility');
const HNApp = require('@odinternational/od-havana-conn');

class VNKing extends ODInstance {
    constructor(king_token, king_id) {
        super('vn_king', 'king_token', king_token, king_id);
    }

    static async findKingWithInfo(username) {
        if (!username) func.throwErrorWithMissingParam('username');
        try {
            const query = `
                SELECT id as king_id, king_token
                FROM vn_king
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

    async registerKing(king_info = {}) {
        if (!king_info) func.throwErrorWithMissingParam('king_info');

        const {name, cell, email, username} = king_info;
        if (!name) func.throwErrorWithMissingParam('name');
        if (!cell) func.throwErrorWithMissingParam('cell');
        if (!email) func.throwErrorWithMissingParam('email');
        if (!username) func.throwErrorWithMissingParam('username');

        try {
            const kingApp = new HNApp(process.env.KING_APP_TOKEN, process.env.KING_APP_KEY);

            const {is_exist} = await kingApp.checkUsernameExist(username);
            if (is_exist) func.throwError('USERNAME HAS BEEN TAKEN', 402);

            const name_parts = name.split(' ');
            const first_name = name_parts[0], last_name = name_parts.pop();

            const {instance_token: king_key} = await kingApp.signupUserInstance(
                username, username, email, first_name, last_name, cell
            );

            this.instance_id = await this.insertInstance({
                name,
                cell,
                email,
                username,
                king_key,
                cdate: 'now()',
                udate: 'now()',
                status: 1
            });

            this.instance_token = `KING-${func.encodeUnify(this.instance_id, 'kg')}`;

            await this.updateInstance({king_token: this.instance_token, username, status: 2});

            return {king_id: this.instance_id, king_token: this.instance_token, username, name};
        } catch (err) {
            throw err;
        }
    }

    static async findKingTokenWithKey(king_key) {
        if (!king_key) func.throwErrorWithMissingParam('king_key');

        try {
            const query = `
                SELECT king_token
                FROM vn_king
                WHERE king_key = '${king_key}'
                LIMIT 0,1
            `;

            const [record] = await VNKing.performQuery(query);

            return record || {};
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VNKing;