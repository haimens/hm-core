const ODInstance = require('../instance.model');


const ODCondition = require('../condition.model');
const func = require('od-utility');


class VNTribute extends ODInstance {

    constructor(tribute_token, tribute_id) {
        super('vn_tribute', 'tribute_token', tribute_token, tribute_id);
    }

    async registerTributeDetail(info = {}, realm_id, coin_id, order_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');
        if (!coin_id) func.throwErrorWithMissingParam('coin_id');

        const {note} = info;

        try {
            this.instance_id = await this.insertInstance(
                {
                    realm_id, note: note || '', coin_id, cdate: 'now()', udate: 'now()',
                    order_id: order_id || 0,
                    status: 0
                }
            );

            this.instance_token = `TBR-${func.encodeUnify(this.instance_id, 'asda')}`;

            await this.updateInstance({tribute_token: this.instance_token, status: 1});

            return {tribute_token: this.instance_token, tribute_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findTributeListWithRealm(search_query = {}, realm_id) {
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const {date_from, date_to, from_key, to_key, start, order_key, order_direction, status} = search_query;
            const conditions = new ODCondition();


            conditions
                .configComplexConditionKeys(
                    'vn_tribute',
                    ['tribute_token', 'cdate', 'udate', 'status', 'note']
                )
                .configComplexConditionKey(
                    'vn_coin',
                    'amount'
                )
                .configComplexConditionJoin(
                    'vn_tribute', 'coin_id', 'vn_coin'
                )
                .configComplexConditionQueryItem(
                    'vn_tribute', 'realm_id', realm_id
                )
                .configDateCondition({date_from, date_to, from_key, to_key}, 'vn_tribute')
                .configComplexOrder(order_key, order_direction, ['cdate', 'udate'], 'vn_tribute')
                .configStatusCondition(status, 'vn_tribute')
                .configQueryLimit(start, 30);

            const count = await this.findCountOfInstance('vn_tribute', conditions);

            if (count === 0) return {record_list: [], count, end: 0};

            const record_list = await this.findInstanceListWithComplexCondition('vn_tribute', conditions);

            return {record_list, count, end: (parseInt(start) || 0) + record_list.length}
        } catch (e) {
            throw e;
        }
    }


    static async findTributeSumWithRealm(realm_id) {
        try {

            const query = `
                SELECT SUM(vn_coin.amount) AS sum 
                FROM vn_tribute 
                LEFT JOIN vn_coin ON vn_tribute.coin_id = vn_coin.id 
                WHERE vn_tribute.realm_id = ${realm_id} 
                AND vn_tribute.status = 1 
            `;

            const [{sum}] = await this.performQuery(query);

            return parseInt(sum) || 0;

        } catch (e) {
            throw e;
        }
    }

    static async cancelTributeWithOrder(order_id, realm_id) {
        try {
            const query = `
                UPDATE vn_tribute SET vn_tribute.status = 0 
                WHERE vn_tribute.order_id = ${order_id} 
                AND vn_tribute.realm_id = ${realm_id} 
            `;

            const response = await this.performQuery(query);

            return {response};
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNTribute;