const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNDriverAction = require('../../models/driver/driver.class');


router.get('/check/token/:driver_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDriverAction.checkDriverWithKey(req.params),
            'DRIVER CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


module.exports = router;