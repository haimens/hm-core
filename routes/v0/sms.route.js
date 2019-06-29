const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNSMSAction = require('../../actions/sms/sms.action');


router.post('/send/order/:realm_token/:order_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNSMSAction.sendSMSWithOrder(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.post('/send/customer/:realm_token/:customer_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSMSAction.sendSMSWithCustomer(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.post('/send/trip/:realm_token/:trip_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNSMSAction.sendSMSWithTrip(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.post('/receive', async (req, res, next) => {

});

router.post('/init', async (req, res, next) => {

});


module.exports = router;