const func = require('od-utility');

class VNDriverPush {
    //type 1 ask driver share location
    //type 2 ask driver fetch customer message.
    static async sendDriverPush(player_key, type) {
        return new Promise((resolve, reject) => {
            try {
                // Push message
                let push_message = '';
                if (type === 1) {
                    push_message = 'Dispatch center wants to know your current status, tap to share';
                } else if (type === 2) {
                    push_message = "You've received a new message";
                } else {
                    func.throwError('UNSUPPORTED PUSH NOTIFICATION TYPE');
                }

                // Push notification content
                var data = {
                    app_id: process.env.ONE_SIGNAL_APP_ID,
                    contents: { 'en': push_message },
                    include_player_ids: [player_key]
                };

                // Request content
                var headers = {
                    "Content-Type": "application/json; charset=utf-8"
                };
                var options = {
                    host: "onesignal.com",
                    port: 443,
                    path: "/api/v1/notifications",
                    method: "POST",
                    headers: headers
                };

                var https = require('https');
                var req = https.request(options, function (res) {
                    res.on('data', function (response) {
                        const parsedResponse = JSON.parse(response);
                        resolve(parsedResponse);
                    });
                });

                req.on('error', function (e) {
                    console.log("ERROR CAPTURED WHEN SENDING REQUEST TO ONE SIGNAL:");
                    console.log(e);
                    throw e;
                });

                req.write(JSON.stringify(data));
                req.end();
            } catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = VNDriverPush;