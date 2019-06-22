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

})({realm_token: 'f3bd1960f347eca3e05ee4d04c46fad0'},
    {name: 'Chris Yao', cell: '8145664700', email: 'chrisyao.od@gmail.com', username: 'vn-lord-01'});


