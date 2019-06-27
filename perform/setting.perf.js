const dotenv = require('dotenv');
dotenv.config();


//REALM-e775d5ca14bd440e244ea374c1f57fc5
const VNSettingAction = require('../actions/setting/setting.action');


async function registerSetting(key, value, realm_token) {

    try {
        const result = await VNSettingAction.registerSetting({realm_token}, {key, value}, {});

        console.log(result);
    } catch (e) {
        // throw e;
        console.log(e);
    }

}


registerSetting('price_base', '3000', 'REALM-e775d5ca14bd440e244ea374c1f57fc5');
registerSetting('price_mile', '175', 'REALM-e775d5ca14bd440e244ea374c1f57fc5');
registerSetting('price_minute', '35', 'REALM-e775d5ca14bd440e244ea374c1f57fc5');