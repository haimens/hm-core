const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNOrderAction = require('../../actions/order/order.action');

router.get('/all/detail/realm/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNOrderAction.findOrderListInRealm(req.params, req.body, req.query)
        );

        res.json(resBody);

    } catch (e) {
        next(e);
    }

});


router.patch('/detail/:realm_token/:order_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNOrderAction.modifyOrderDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.get('/all/detail/customer/:realmt_token/:customer_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNOrderAction.findOrderDetail(req.params, req.body, req.query)
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.patch('/discount/:realm_token/:order_token/:order_discount_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNOrderAction.modifyOrderDiscountItem(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

router.post('/discount/:realm_token/:order_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNOrderAction.registerOrderDiscountInOrder(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }
});

module.exports = router;