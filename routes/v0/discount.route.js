const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNDiscountAction = require('../../actions/discount/discount.action');


router.post('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDiscountAction.registerDiscount(
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
            await VNDiscountAction.findDiscountListInReaml(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.patch('/detail/:realm_token/:discount_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNDiscountAction.modifyDiscountDetail(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;