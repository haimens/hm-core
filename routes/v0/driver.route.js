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

router.post('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.registerDriver(
                req.params, req.body, req.query
            )
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

router.patch('/detail/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.modifyDriverDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.post('/car/:realm_token/:driver_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNDriverAction.registerDriverCar(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/car/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.findDriverCarListWithDriver(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);

    } catch (e) {
        next(e);
    }
});

router.patch('/car/:realm_token/:driver_car_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.modifyDriverCar(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/detail/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.findDriverDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/payable/realm/:realm_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNDriverAction.findDriverPayableList(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.patch('/share/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.requestDriverLocationShare(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;