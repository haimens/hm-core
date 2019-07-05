const express = require('express');
const router = express.Router();

const func = require('od-utility');


const VNTripAction = require('../../actions/trip/trip.action');


router.get('/detail/:realm_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.findTripDetail(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/count/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.findMonthCountForTripInRealm(
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
            await VNTripAction.findTripListInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.patch('/addon/:realm_token/:order_token/:trip_token/:addon_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.modifyAddonInTrip(
                req.params, req.body.req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/all/detail/driver/:realm_token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.findTripWithDriver(req.params, req.body, req.query)
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});

router.post('/addon/:realm_token/:order_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.registerAddonForTrip(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.post('/alerts/:realm_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.registerTripAlerts(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.patch('/detail/:realm_token/:trip_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNTripAction.modifyTripBasicDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.patch('/operation/:realm_token/:trip_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTripAction.modifyTripOperationInfo(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});
module.exports = router;