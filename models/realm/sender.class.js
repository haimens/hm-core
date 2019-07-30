const ODSMS = require('@odinternational/od-sms');
const ODEmail = require('@sendgrid/mail');

const func = require('od-utility');


class VNSender {


    static async sendSMS(resource_info, msg, cell) {
        try {


            const {twilio_account_id, twilio_auth_token, twilio_from_num} = resource_info;
            if (!twilio_account_id) func.throwErrorWithMissingParam('twilio_account_id');
            if (!twilio_auth_token) func.throwErrorWithMissingParam('twilio_auth_token');
            if (!twilio_from_num) func.throwErrorWithMissingParam('twilio_from_num');

            const smsObj = new ODSMS(twilio_account_id, twilio_auth_token);
            return await smsObj.sendMessage(msg, twilio_from_num, cell);
        } catch (e) {
            throw e;
        }

    }

    static async sendEmail(sendgrid_api_key, sendgrid_from_email, email, title, msg) {

        try {
            ODEmail.setApiKey(sendgrid_api_key);
            const options = {
                to: [email],
                from: sendgrid_from_email,
                subject: title,
                text: msg,
                html: msg
            };

            return new Promise((resolve, reject) => {
                ODEmail.send(options, (err, response) => {
                    if (err) reject(err);
                    resolve(response);
                });
            });
        } catch (e) {
            throw e;
        }
    }
}

module.exports = VNSender;