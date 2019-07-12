const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNNoteAction = require('../../actions/note/note.action');

router.post('/detail/customer/:realm_token/:customer_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNNoteAction.registerOrderNoteWithCustomer(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});

router.post('/detail/trip/:realm_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction.registerOrderNoteWithTrip(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});

router.post('/detail/order/:realm_token/:order_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction.registerOrderNoteWithOrder(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});

router.get('/all/detail/order/:realm_token/:order_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction.findOrderNoteListWithOrder(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});

router.get('/all/detail/customer/:realm_token/:customer_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction.findOrderNoteListWithCustomer(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});

router.get('/all/detail/trip/:realm_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction.modifyOrderNoteDetail(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }

});


router.patch('/detail/:realm_token/:order_note_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNNoteAction(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        throw e;
    }
});

module.exports = router;