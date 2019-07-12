const express = require('express');
const router = express.Router();

const func = require('od-utility');


const VNFlightAction = require('../../actions/flight/flight.action');


router.post('/search/:realm_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNFlightAction.searchFlight(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;