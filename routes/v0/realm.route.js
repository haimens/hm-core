const express = require('express');
const router = express.Router();
const func = require('od-utility');

const VNRealmAction = require('../../actions/realm/realm.action');


//1
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

//2
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

//3
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


//4
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


//5
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


//6
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


//7
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


//8
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


//9
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


//10
router.get('/all/email/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNRealmAction.findEmailResourceList(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

//11
router.get('/all/message/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNRealmAction.findMessageResourceList(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


//12
router.get('/all/payment/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNRealmAction.findPaymentResourceList(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;