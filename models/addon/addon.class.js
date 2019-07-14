const ODInstance = require('../instance.model');
const ODCondition = require('../condition.model');


const func = require('od-utility');

class VNAddon extends ODInstance {

    constructor(addon_token, addon_id) {
        super('vn_addon', 'addon_token', addon_token, addon_id);
    }


    async registerAddon(info = {}, trip_id, order_id, customer_id, realm_id) {
        const {amount, type, note} = info;
        if (!amount) func.throwErrorWithMissingParam(amount);
        if (!type) func.throwErrorWithMissingParam('type'); // 1 TIP, 2 OTHER
        if (!note) func.throwErrorWithMissingParam('note');
        if (!trip_id) func.throwErrorWithMissingParam('trip_id');
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!customer_id) func.throwErrorWithMissingParam('customer_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            this.instance_id = await this.insertInstance(
                {
                    amount, type, note, trip_id, order_id,
                    customer_id, realm_id,
                    cdate: 'now()', udate: 'now()', status: 0
                });

            this.instance_token = `ADO-${func.encodeUnify(this.instance_id, 'ado')}`;

            await this.updateInstance({addon_token: this.instance_token, status: 1});

            return {addon_token: this.instance_token, addon_id: this.instance_id};
        } catch (e) {
            throw e;
        }
    }

    static async findAddonListInOrder(order_id, realm_id) {
        if (!order_id) func.throwErrorWithMissingParam('order_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_addon',
                    ['amount', 'type', 'note', 'cdate', 'udate', 'addon_token', "status"]
                )
                .configComplexConditionQueryItem(
                    'vn_addon',
                    'realm_id', realm_id
                )
                .configComplexConditionQueryItem(
                    'vn_addon',
                    'order_id', order_id
                )
                .configStatusCondition(1, 'vn_addon')
                .configQueryLimit(0, 10);

            const record_list = await this.findInstanceListWithComplexCondition('vn_addon', conditions);

            return {record_list};

        } catch (e) {
            throw e;
        }
    }

    static async findAddonListInTrip(trip_id, realm_id) {
        if (!trip_id) func.throwErrorWithMissingParam('order_id');
        if (!realm_id) func.throwErrorWithMissingParam('realm_id');

        try {
            const conditions = new ODCondition();

            conditions
                .configComplexConditionKeys(
                    'vn_addon',
                    ['amount', 'type', 'note', 'cdate', 'udate', 'addon_token', "status"]
                )
                .configComplexConditionQueryItem(
                    'vn_addon',
                    'realm_id', realm_id
                )
                .configComplexConditionQueryItem(
                    'vn_addon',
                    'trip_id', trip_id
                )
                .configQueryLimit(0, 30);

            const record_list = await this.findInstanceListWithComplexCondition('vn_addon', conditions);

            return {record_list};

        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNAddon;