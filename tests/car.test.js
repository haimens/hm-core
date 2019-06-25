const dotenv = require('dotenv');
dotenv.config();

const VNCar = require('../models/car/car.class');


async function testCarRegister(plate_num, description, identifier, img_path) {
    try {
        const carObj = new VNCar();

        const result = await carObj.registerCar({plate_num, description, identifier, img_path}, 1);
        console.log(result);
    } catch (e) {
        throw e;
    }
}


async function testCarList(realm_id) {
    try {
        const result = await VNCar.findCarListInRealm(1, {start: 0});
        console.log(result);

    } catch (e) {
        throw e;
    }
}

// testCarRegister('xxxxxxx', 'White 2019 iit', 'test car', 'WWW.GOOGLE.COM');

testCarList(1);

