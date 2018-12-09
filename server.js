var unirest = require('unirest');


const PRESENCE_API_URL = process.env.PRESENCE_API_URL;
const BOT_ID = process.env.BOT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_CHAT_ID = process.env.BOT_CHAT_ID;

function doAlerting(presence) {
    console.log(presence);
    if (Object.keys(presence).length < 2) {
        console.log('Presence empty or less than 2');
    } else {
        let personsArray = [];
        for (const person in presence) {
            personsArray.push(person);
        }

        if (presence[personsArray[0]].alerted === presence[personsArray[1]].alerted) {
            console.log('alerted status is the same for both, so no need to alert');
            if (presence[personsArray[0]].alerted === false) {
                //This is a scenario where both the status were updated at the same time, so we wont alert, but we do need to update the alerted status to true
                updateAlertStatus(personsArray[0]);
                updateAlertStatus(personsArray[1]);
            }
        } else {
            console.log('alerted status differs, so lets alert for the necessary person and update alerted status');
            if (presence[personsArray[0]].alerted === false) {
                sendTelegramAlert(personsArray[0], presence[personsArray[0]].status);
                updateAlertStatus(personsArray[0]);
            } else {
                sendTelegramAlert(personsArray[1], presence[personsArray[1]].status);
                updateAlertStatus(personsArray[1]);
            }
        }
    }
}

function sendTelegramAlert(person, message) {
    console.log('Alert: ' + person + ' has ' + message + ' GR');
    let message_text = '';
    if (message === 'exited') {
        message_text = person + ' has left home';
    } else {
        message_text = person + ' has arrived home';
    }
    unirest.get('https://api.telegram.org/bot' + BOT_ID + ':' + BOT_TOKEN + '/sendMessage?chat_id=' + BOT_CHAT_ID + '&text=' + message_text)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (response) {
            console.log('Alerting done');
        });
}

function updateAlertStatus(person) {
    unirest.patch(PRESENCE_API_URL + person + '/alerted')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (response) {
            console.log(PRESENCE_API_URL + person + '/alerted')
        });
}

async function doProcess() {
    console.log(PRESENCE_API_URL);
    unirest.get(PRESENCE_API_URL)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .end(function (response) {
            doAlerting(response.body);
        });
    await sleep(5000);
    doProcess();
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

doProcess();

