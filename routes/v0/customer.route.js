const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNCustomerAction = require('../../models/customer/customer.class');


router.get('/check/token/:customer_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCustomerAction.checkCustomerWithKey(req.params),
            'CUSTOMER CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


module.exports = router;