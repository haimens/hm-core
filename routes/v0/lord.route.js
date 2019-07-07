const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNLordAction = require('../../actions/lord/lord.action');


router.get('/check/token/:lord_key', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.checkLordWithKey(req.params),
            'LORD CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});

router.get('/all/detail/system', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.findLordListInSystem(req.params, req.body, req.query),
            'LORD LIST FOUND'
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/detail/realm/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.findLordListInRealm(req.params, req.body, req.query),
            'LORD LIST FOUND'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


router.post('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.registerLord(
                req.params, req.body, req.query
            ),
            'LORD REGISTER'
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.patch('/detail/:lord_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.modifyLordDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;