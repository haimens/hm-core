const dotenv = require('dotenv');
dotenv.config();

const VNRealmAction = require('../actions/realm/realm.action');


(async (body) => {
    try {
        console.log('START TESTING REGISTER REALM');
        console.log(VNRealmAction);

        const result_info = await VNRealmAction.registerRealm({}, body, {});
        console.log(result_info);
    } catch (e) {
        console.log(e);
    }
})({
    realm_info: {
        company_name: 'TEST COMPANY 4',
        logo_path: 'http://ralkef.com',
        icon_path: 'http://rallls.com',
        company_title: 'test'
    },
    tribute_rate_token: 'TRBR-536571ed91fae2913d718f959ec14f3e',
    address_str: '15526 Balsam Ct, Chino Hills, CA, 91709'
});