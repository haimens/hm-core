const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNSalaryAction = require('../../actions/salary/salary.action');


router.post('/detail/:realm_token/:driver_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNSalaryAction.registerSalary(
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
            await VNSalaryAction.findSalaryListInRealm(
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
            await VNSalaryAction.findSalaryListWithDriver(
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
            await VNSalaryAction.findSalarySumInRealm(
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
            await VNSalaryAction.findSalarySumWithDriver(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:salary_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSalaryAction.modifySalaryDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;