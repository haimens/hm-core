const func = require('od-utility');

const express = require('express');
const router = express.Router();

const VNCarAction = require('../../actions/car/car.action');


router.post('/type/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.registerCarType(
                req.params, req.body, req.query, req.lord.verify_info
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/type/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.findCarTypeListInRealm(
                req.params, req.body.req.query
            )
        );

        res.json(resBody);


    } catch (e) {
        next(e);
    }

});

// router.get('/type/:realm_token/:car_type_token', async (req, res, next) => {
//     try {
//         const resBody = func.configSuccess(
//             await VNCarAction(req.params, req.body, req.query)
//         );
//
//         res.json(resBody);
//     } catch (e) {
//         next(e);
//     }
// });

router.patch('/type/:realm_token/:car_type_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.modifyCarTypeDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

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

router.get('/detail/:realm_token/:car_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.findCarDetail(
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

router.post('/driver/:realm_token/:car_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.registerDriverCar(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/driver/:realm_token/:car_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNCarAction.findDriverCarListWithCar(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/driver/:realm_token/:driver_car_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNCarAction.modifyDriverCar(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;