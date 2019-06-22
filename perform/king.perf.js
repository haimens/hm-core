const dotenv = require('dotenv');
dotenv.config();
const VNKing = require('../models/king/king.class');


(async (username, name, cell, email) => {

    try {
        const kingObj = new VNKing();
        console.log('START TESTING');
        const result_info = await kingObj.registerKing({username, name, cell, email});
        console.log(result_info);
    } catch (e) {
        console.log(e);
    }
})('vn-king-01', 'Chris Yao', '8145664700', 'chrisyao.od@gmail.com');