const dotenv = require('dotenv');
dotenv.config();
const VNTributeRate = require('../models/tribute/rate.class');


(async (rate) => {

    try {
        const rateObj = new VNTributeRate();
        console.log('START TESTING REGISTER TRIBUTE RATE');
        const result_info = await rateObj.registerTributeRate(rate);
        console.log(result_info);
    } catch (e) {
        console.log(e);
    }
})(30);