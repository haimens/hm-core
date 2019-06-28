const express = require('express');
const router = express.Router();

const func = require('od-utility');

const VNRealmAction = require('../../actions/realm/realm.action');


router.get('/all/detail/system', async (req, res, next) => {

    try {

        const resBody = func.configSuccess(
            await VNRealmAction.findRealmListInSystem(req.params, req.body, req.query),
            'REALM LIST FOUND'
        );

        res.json(resBody);
    } catch (e) {
        next(e);
    }

});


router.post('/detail', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNRealmAction.registerRealm(
                req.params, req.body, req.query
            ),
            'REALM REGISTERED'
        );

        res.json(resBody)
    } catch (e) {
        next(e);
    }
});


module.exports = router;