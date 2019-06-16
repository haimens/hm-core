const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNLordAction = require('../../models/lord/lord.class');


router.get('/check/token/:lord_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNLordAction.checkLordWithKey(req.params),
            'KING CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


module.exports = router;