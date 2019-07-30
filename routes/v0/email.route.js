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


router.post('/send/lord/:realm_token/:lord_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNEmailAction.sendEmailWithLord(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.post('/send/driver/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNEmailAction.sendEmailWithDriver(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.post('/send/realm/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNEmailAction.sendEmailWithRealm(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;