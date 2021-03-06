const express = require('express');
const router = express.Router();

const func = require('od-utility');
const VNKingAction = require('../../actions/king/king.action');


router.get('/check/token/:king_key', async (req, res, next) => {
    try {
        const resBody = func.configSuccess(
            await VNKingAction.checkKingWithKey(req.params),
            'KING CHECKED'
        );
        res.json(resBody);

    } catch (e) {
        next(e);
    }
});


module.exports = router;