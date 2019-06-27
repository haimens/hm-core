const dotenv = require('dotenv');
dotenv.config();

const VNRealmAction = require('../actions/realm/realm.action');


(async (body) => {
    try {
        console.log('START TESTING REGISTER REALM');

        const result_info = await VNRealmAction.registerRealm({}, body, {});
        console.log(result_info);
    } catch (e) {
        console.log('ERROR:', e);
    }
})({
    realm_info: {
        company_name: 'HEHE COMPANY 7',
        logo_path: 'http://ralkef.com',
        icon_path: 'http://rallls.com',
        company_title: 'hehe7'
    },
    tribute_rate_token: 'TRBR-536571ed91fae2913d718f959ec14f3e',
    address_str: '17022 Colima Rd'
});



// (async (query) => {
//     try {
//         console.log('START TESTING REGISTER REALM');
//
//         const result_info = await VNRealmAction.findRealmList({}, {}, query);
//         console.log(result_info);
//     } catch (e) {
//         console.log('ERROR:', e);
//     }
// })({keywords:'hehe'});