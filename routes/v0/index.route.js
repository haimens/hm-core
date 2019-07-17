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
const tripRoute = require('./trip.route');

const orderRoute = require('./order.route');
const alertRoute = require('./alert.route');

const addressRoute = require('./address.route');
const coinRoute = require('./coin.route');
const invoiceRoute = require('./invoice.route');
const carRoute = require('./car.route');

const wageRoute = require('./wage.route');
const salaryRoute = require('./salary.route');

const flightRoute = require('./flight.route');
const discountRoute = require('./discount.route');

const settingRoute = require('./setting.route');
const noteRoute = require('./note.route');


router.use("/king", kingRoute);
router.use("/driver", driverRoute);
router.use("/customer", customerRoute);
router.use("/lord", lordRoute);


router.use('/quote', quoteRoute);
router.use('/realm', realmRoute);
router.use('/tribute', tributeRoute);
router.use('/message', messageRoute);
router.use('/order', orderRoute);
router.use('/alert', alertRoute);

router.use('/trip', tripRoute);
router.use('/address', addressRoute);
router.use('/coin', coinRoute);

router.use('/invoice', invoiceRoute);
router.use('/car', carRoute);

router.use('/wage', wageRoute);
router.use('/salary', salaryRoute);
router.use('/flight', flightRoute);
router.use('/discount', discountRoute);
router.use('/setting', settingRoute);
router.use('/note', noteRoute);


router.use("/", async (req, res, next) => {
    try {
        func.throwError("CORE V0 INDEX REACHED");
    } catch (err) {
        next(err.message);
    }
});

module.exports = router;
