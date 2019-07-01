const dotenv = require('dotenv');
dotenv.config();
const VNCustomerAction = require('../actions/customer/customer.action');


(async (username, name, cell, email, license_num, identifier, realm_token) => {

    try {

        console.log('START TESTING');
        const result_info = await VNCustomerAction.registerCustomer({realm_token}, {
            customer_info: {
                name,
                cell,
                email
            }
        });
        console.log(result_info);
    } catch (e) {
        console.log(e);
    }
})('vn-customer-03', 'Lulu Jiang', '+19492761445', 'lujiang.od@gmail.com', '887SUYYS', 'chris', 'REALM-3ec72d3a5be4deb52333787fceefec19');