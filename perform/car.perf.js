const dotenv = require('dotenv');
dotenv.config();


const VNCarAction = require('../actions/car/car.action');


(async (realm_token, type_list) => {


    try {

        const promise_list = type_list.map(info => {
            return VNCarAction.registerCarType({realm_token}, info, {});
        });

        const results = await Promise.all(promise_list);

        console.log(results);
    } catch (e) {
        console.log(e);
    }
})('REALM-e775d5ca14bd440e244ea374c1f57fc5', [
    {
        name: 'SEDAN', price_prefix: '0',
        img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a1e60dc78feea85181d7b56979a766e4.jpeg'
    },
    {
        name: 'MINIVAN', price_prefix: '1000',
        img_path: 'https://image.od-havana.com/doc/avatar/415891807ba81eb828a345b682618a2f/a3fcff7ad2625723da1c84bf35ef101b.jpeg'
    }
]);
