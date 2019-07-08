const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNDriverAction = require('../../actions/driver/driver.action');


router.get('/check/token/:driver_key', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.checkDriverWithKey(req.params),
            'DRIVER CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


router.get('/location/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.findDriverLocation(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.post('/location/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.registerDriverLocation(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/all/location/realm/:realm_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNDriverAction.findDriverLocationListInRealm(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.get('/all/detail/realm/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.findDriverListInRealm(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

module.exports = router;