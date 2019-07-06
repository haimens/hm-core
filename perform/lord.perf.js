const dotenv = require('dotenv');
dotenv.config();
const VNLordAction = require('../actions/lord/lord.action');

const VNLord = require('../models/lord/lord.class');

const HNApp = require('@odinternational/od-havana-conn');
// (async (params, body) => {
//
//     try {
//         console.log('START TESTING');
//
//         const result_info = await VNLordAction.registerLord(params, body);
//
//         console.log(result_info);
//     } catch (e) {
//         throw e;
//     }
//
// })({realm_token: 'REALM-428190c75115fe0b3dff74eb8cd00a09'},
//     {name: 'Chris Yao', cell: '8145664700', email: 'chrisyao.od@gmail.com', username: 'vn-lord-02'});


(async () => {
    try {
        // const {record_list} = await VNLord.findLordListInSystem({});
        //
        // const lordApp = new HNApp(process.env.LORD_APP_TOKEN, process.env.LORD_APP_KEY);
        //
        //
        // // const promise_list = record_list.map(record => {
        // //
        // //     return new Promise((resolve, reject) => {
        // //         const {lord_token} = record;
        // //         lordApp.findRandomImageWithService('avatar')
        // //             .then(result => result.image_path)
        // //             .catch(reject)
        // //             .then(img_path => {
        // //                 const lordObj = new VNLord(lord_token);
        // //                 lordObj.modifyInstanceDetailWithToken({img_path}, ['img_path']).then(resolve)
        // //             });
        // //     });
        // //
        // // });
        // //
        // // const results = await Promise.all(promise_list);
        //
        // console.log(record_list);
        // console.log(results);
    } catch (e) {
        console.log(e);
    }
})();


