const dotenv = require('dotenv');
dotenv.config();
const VNDriverAction = require('../actions/driver/driver.action');


(async (username, name, cell, email, license_num, identifier, realm_token) => {

    try {

        console.log('START TESTING');
        const result_info = await VNDriverAction.registerDriver({realm_token}, {
            username,
            name,
            cell,
            email,
            license_num,
            identifier
        });
        console.log(result_info);
    } catch (e) {
        console.log(e);
    }
})('vn-driver-02', 'Chris Yao', '8145664700', 'chrisyao.od@gmail.com', '887SUYYS', 'chris', 'f3bd1960f347eca3e05ee4d04c46fad0');