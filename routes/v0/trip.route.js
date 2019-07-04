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

module.exports = router;