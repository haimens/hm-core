const dotenv = require('dotenv');
dotenv.config();
const VNLordAction = require('../actions/lord/lord.action');


(async (params, body) => {

    try {
        console.log('START TESTING');

        const result_info = await VNLordAction.registerLord(params, body);

        console.log(result_info);
    } catch (e) {
        throw e;
    }

})({realm_token: 'REALM-428190c75115fe0b3dff74eb8cd00a09'},
    {name: 'Chris Yao', cell: '8145664700', email: 'chrisyao.od@gmail.com', username: 'vn-lord-02'});


