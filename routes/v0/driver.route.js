const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNDriverAction = require('../../actions/driver/driver.action');


router.get('/check/token/:driver_key', async (req, res, next) => {
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