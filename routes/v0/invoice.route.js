const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNInvoiceAction = require('../../actions/invoice/invoice.action');


router.get('/all/detail/realm/:realm_token', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNInvoiceAction.findInvoiceListInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});

router.get('/all/detail/system', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNInvoiceAction.findInvoiceListInSystem(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.post('/detail/:realm_token', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNInvoiceAction.registerInvoice(
                req.params, req.body, req.query
            )
        );
        res.json(resBody);
    } catch (e) {
        next(e);
    }
});


router.get('/sum/realm/:realm_token', async (req, res, next) => {

    try {
        const resBody = func.configSuccess(
            await VNInvoiceAction.findInvoiceSumInRealm(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.patch('/detail/:realm_token/:invoice_token', async (req, res, next) => {
    try {

        const resBody = func.configSuccess(
            await VNInvoiceAction.modifyInvoiceDetail(
                req.params, req.body, req.query
            )
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


module.exports = router;