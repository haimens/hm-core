const express = require("express");
const router = express.Router();

const func = require("od-utility");

const kingRoute = require('./king.route');
const driverRoute = require('./driver.route');
const customerRoute = require('./customer.route');
const lordRoute = require('./lord.route');

const quoteRoute = require('./quote.route');

router.use("/king", kingRoute);
router.use("/driver", driverRoute);
router.use("/customer", customerRoute);
router.use("/lord", lordRoute);


router.use('/quote', quoteRoute);

router.use("/", async (req, res, next) => {
    try {
        func.throwError("CORE V0 INDEX REACHED");
    } catch (err) {
        next(err.message);
    }
});

module.exports = router;
