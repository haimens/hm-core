const express = require('express');
const router = express.Router();

const func = require('od-utility');


const VNAddressAction = require('../../actions/address/address.action');


router.post('/detail', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNAddressAction.registerAddress(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;