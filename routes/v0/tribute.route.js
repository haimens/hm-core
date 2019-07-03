const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNTributeAction = require('../../actions/tribute/tribute.action');


router.post('/rate', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTributeAction.registerTributeRate(req.params, req.body, req.query),
            'RATE REGISTERED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});

router.get('/all/rate', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTributeAction.findTributeRateList(req.prams, req.body, req.query),
            'TRIBUTE RATE LSIT FOUND'
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/rate/:tribute_rate_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNTributeAction.modifyTributeRate(req.params, req.body, req.query),
            'TRIBUTE RATE MODIFIED'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


module.exports = router;