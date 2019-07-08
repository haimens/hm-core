const func = require('od-utility');

const express = require('express');
const router = express.Router();

const VNCarAction = require('../../actions/car/car.action');


router.post('/detail/:realm_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNCarAction.registerCar(
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
            await VNCarAction.findCarListInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.patch('/detail/:realm_token/:car_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.modifyCarDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;