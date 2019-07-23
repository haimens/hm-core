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


router.post('/send/dispatch/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSMSAction.sendSMSWithDispatch(
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
    try {
        const resBody = func.configSuccess(
            await VNSMSAction.receiveSMSReply(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.post('/init', async (req, res, next) => {

    try {
        console.log('init', req.body);
        res.json(body);
    } catch (e) {
        next(e);
    }

});


router.get('/all/detail/realm/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSMSAction.findSMSHistoryListWithRealm(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/all/detail/customer/:customer_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNSMSAction.findSMSHistoryListWithCustomer(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:sms_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNSMSAction.modifySMSDetail(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

module.exports = router;