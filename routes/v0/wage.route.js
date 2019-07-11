const express = require('express');
const router = express.Router();

const func = require('od-utility');


const VNWageAction = require('../../actions/wage/wage.action');
router.post('/detail/:realm_token/:driver_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNWageAction.registerWage(
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
            await VNWageAction.findWageListInRealm(
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
            await VNWageAction.findWageListWithDriver(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/sum/realm/:realm_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNWageAction.findWageSumInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/sum/driver/:realm_token/:driver_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNWageAction.findWageSumWithDriver(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:wage_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNWageAction.modifyWageDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;