const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNAlertAction = require('../../actions/alert/alert.action');


router.get('/all/detail/realm/:realm_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNAlertAction.findAlertListInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:alert_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNAlertAction.modifyAlert(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;