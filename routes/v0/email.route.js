const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNEmailAction = require('../../actions/email/email.action');


router.post('/send/customer/:realm_token/:customer_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNEmailAction.sendEmailWithCustomer(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;