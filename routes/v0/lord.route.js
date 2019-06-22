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


module.exports = router;