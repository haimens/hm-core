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


module.exports = router;