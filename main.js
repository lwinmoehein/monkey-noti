import fetch from "node-fetch";
import fs, {appendFile} from 'fs/promises';
import crypto from 'crypto';

function calculateHash(inputString) {
    const hash = crypto.createHash('sha256').update(inputString);
    return hash.digest('hex'); // Return the hash in hexadecimal format
}


let shouldKeepRequesting = true;
let lastCheckSum = "";

const fetchOptionsFilePath =  'options.json';
const logsFilePath =  'logs.txt';

async function writeLogToFile(newJson) {
    try {
        await appendFile(logsFilePath,  JSON.stringify(newJson, null, 2) + '\n');
    } catch (err) {
    }
}
const getDubaiTime = (isoDate) => {
    const dubaiFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dubai',      // Dubai timezone
        year: 'numeric',
        month: 'long',               // Full month name
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true                 // 12-hour format (AM/PM)
    });

    return dubaiFormatter.format(new Date(isoDate));
};
async function getFetchOptions() {
    // Read the JSON file
    const data = await fs.readFile(fetchOptionsFilePath, 'utf-8');

    // Parse the JSON data into a JavaScript object
    return JSON.parse(data);
}
async function getFetchData() {
    // Read the JSON file
    return await fs.readFile(fetchOptionsFilePath, 'utf-8');
}



async function sendMessage() {
    const token = '7273799390:AAFcptLnAtvmR4aVNL4APxW-IUt8rL2C8_4';
    const chatId = -4553980792;
    const message = 'Jobs found, Hurry!';

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: message
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.ok) {
            console.log('Message sent successfully');
        } else {
            console.error('Error sending message:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendRequest() {
    try {
        const options = await getFetchOptions();

        const response = await fetch("https://ui.appen.com.cn/api-gw/project/v3/job/worker-records", options);

        const data = await response.json();

        if(data.status===200){
           const responseData = data.data;
           if(responseData.availableTasks>0){
               console.log('Request succeed, message sent:'+JSON.stringify(responseData));
               sendMessage();
               writeLogToFile({time:getDubaiTime(new Date().toISOString()),count:responseData.availableTasks})
           }else{
               console.log('Request succeed:'+responseData.availableTasks);
               writeLogToFile({time:getDubaiTime(new Date().toISOString()),count:responseData.availableTasks})
           }
        }

        if(data.status!==200){
           console.log('Request failed:'+data.status)
           await writeLogToFile({time: getDubaiTime(new Date().toISOString()), count: -1000})
           shouldKeepRequesting = false;
        }
        const newFetchData = await getFetchData();
        lastCheckSum = calculateHash(newFetchData);
    } catch (error) {
        console.log('Request error.')
        shouldKeepRequesting = false;
    }
}


function startLoop() {
    setInterval(async () => {
        const newFetchData = await getFetchData();
        const newFetchOptionCheckSum = calculateHash(newFetchData);

        if (!shouldKeepRequesting) {
            shouldKeepRequesting = (newFetchOptionCheckSum !== lastCheckSum)
        }

        if (shouldKeepRequesting) {
            await sendRequest()
        }
    }, 10000);
}

startLoop();
