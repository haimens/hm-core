const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNSettingAction = require('../../actions/setting/setting.action');


router.post('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSettingAction(
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
            await VNSettingAction(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/detail/key/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSettingAction(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:setting_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNSettingAction(req.params, req.body, req.query)
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});
module.exports = router;