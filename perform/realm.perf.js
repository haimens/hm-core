const dotenv = require('dotenv');
dotenv.config();

const VNRealmAction = require('../actions/realm/realm.action');
const VNRealm = require('../models/realm/realm.class');

//
// (async (body) => {
//     try {
//         console.log('START TESTING REGISTER REALM');
//
//         const result_info = await VNRealmAction.registerRealm({}, body, {});
//         console.log(result_info);
//     } catch (e) {
//         console.log('ERROR:', e);
//     }
// })({
//     realm_info: {
//         company_name: 'HEHE COMPANY 7',
//         logo_path: 'http://ralkef.com',
//         icon_path: 'http://rallls.com',
//         company_title: 'hehe7'
//     },
//     tribute_rate_token: 'TRBR-536571ed91fae2913d718f959ec14f3e',
//     address_str: '17022 Colima Rd'
// });


// (async () => {
//     try {
//         const {record_list} = await VNRealmAction.findRealmListInSystem({}, {}, {start: 30});
//
//         console.log(record_list);
//
//
//         const HNApp = require('@odinternational/od-havana-conn');
//         const lordApp = new HNApp(process.env.LORD_APP_TOKEN, process.env.LORD_APP_KEY);
//
//         const promise_list = await record_list.map(record => {
//
//             return new Promise((resolve, reject) => {
//                 const {realm_token} = record;
//
//                 lordApp.findRandomImageWithService('logo')
//                     .then(i_r => i_r.image_path)
//                     .catch(reject)
//                     .then(img_path => {
//                         const realmObj = new VNRealm(realm_token);
//
//                         realmObj.modifyInstanceDetailWithToken({
//                             logo_path: img_path,
//                             icon_path: img_path
//                         }, ['logo_path', 'icon_path']).then(resolve).catch(reject)
//                     });
//
//             });
//
//         });
//
//         console.log(record_list);
//
//         const result_list = await Promise.all(promise_list);
//         console.log(result_list);
//     } catch (e) {
//         console.log(e);
//     }
// })();

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