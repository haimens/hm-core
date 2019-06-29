const express = require("express");
const router = express.Router();

const func = require("od-utility");

const kingRoute = require('./king.route');
const driverRoute = require('./driver.route');
const customerRoute = require('./customer.route');
const lordRoute = require('./lord.route');

const quoteRoute = require('./quote.route');
const realmRoute = require('./realm.route');
const tributeRoute = require('./tribute.route');

const messageRoute = require('./sms.route');


router.use("/king", kingRoute);
router.use("/driver", driverRoute);
router.use("/customer", customerRoute);
router.use("/lord", lordRoute);


router.use('/quote', quoteRoute);
router.use('/realm', realmRoute);
router.use('/tribute', tributeRoute);
router.use('/message', messageRoute);

router.use("/", async (req, res, next) => {
    try {
        func.throwError("CORE V0 INDEX REACHED");
    } catch (err) {
        next(err.message);
    }
});

module.exports = router;
