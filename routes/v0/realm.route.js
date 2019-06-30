const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNRealmAction = require('../../actions/realm/realm.action');


router.get('/all/detail/system', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNRealmAction.findRealmListInSystem(req.params, req.body, req.query),
            'REALM LIST FOUND'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.post('/detail', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.registerRealm(
                req.params, req.body, req.query
            ),
            'REALM REGISTERED'
        );

        res.json(resBody)
    } catch (e) {
        next(e);
    }
});

router.post('/message/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.registerMessageResource(req.params, req.body, req.query),
            'MESSAGE RESOURCE REGISTER SUCCESS'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/detail/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNRealmAction.findRealmDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.patch('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.modifyBasicRealmDetail(req.params, req.body, req.query),
            'REALM BASIC INFO UPDATED'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.patch('/resource/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNRealmAction.modifyPrimaryResourceInRealm(req.params, req.body, req.query),
            'REALM PRIMARY RESOURCE INFO UPDATED'
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.patch('/email/:realm_token/:email_resource_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNRealmAction.modifyEmailResource(req.params, req.body, req.query),
            'REALM EMAIL RESOURCE INFO UPDATED'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.patch('/message/:realm_token/:message_resource_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.modifyMessageResource(req.params, req.body, req.query),
            'REALM MESSAGE RESOURCE INFO UPDATED'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.patch('/payment/:realm_token/:payment_resource_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.modifyPaymentResource(req.params, req.body, req.query),
            'REALM PAYMENT RESOURCE INFO UPDATED'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});





module.exports = router;