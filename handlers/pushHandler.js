const webpush = require('web-push');
const Push = require('../models/pushSubscription');
const utils = require('../lib/utils');
const vapidKeys = {
    "publicKey":process.env.VAPID_PUBLIC_KEY,
    "privateKey":process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    'mailto:opeonikuts@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

module.exports.sendNotification = function(res, title, body) {

    getPushSubscriptions.then(results => {
        const notificationPayload = {
            "notification": {
                "title": title,
                "body": body,
                "icon": "../assets/circled-s-filled.png",
                "vibrate": [100, 50, 100],
                "data": {
                    "dateOfArrival": Date.now(),
                    "primaryKey": 1
                },
                "actions": [{
                    "action": "explore",
                    "title": title
                }]
            }
        };

        Promise.all(results.map(sub => webpush.sendNotification(
            sub, JSON.stringify(notificationPayload) )))
            .then(() => utils.sendSuccess(res))
            .catch(err => {
                utils.sendError(res, err || 'Unknown issue.');
                console.error("Error sending notification, reason: ", err);
            });

    }).catch(err => {
        utils.sendError(res, err || 'Unknown issue.');
        console.log(err);
    });
}

function getPushSubscriptions () {

    return new Promise((resolve, reject) => {
        Push.find({})
            .exec()
            .then(results => {
                resolve(results)
            }).catch(err => {
                reject(err);
            })
    });
}