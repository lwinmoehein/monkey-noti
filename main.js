import fetch from "node-fetch";
import fs from 'fs/promises';
import path from 'path';
import { appendFile } from 'fs/promises';

let shouldKeepRequesting = true;

const fetchOptionsFilePath =  'options.json';
const logsFilePath =  'logs.txt';

async function writeLogToFile(newJson) {
    try {
        await appendFile(logsFilePath,  JSON.stringify(newJson, null, 2) + '\n');
    } catch (err) {
    }
}

async function getFetchOptions() {
    // Read the JSON file
    const data = await fs.readFile(fetchOptionsFilePath, 'utf-8');

    // Parse the JSON data into a JavaScript object
    return JSON.parse(data);
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
               writeLogToFile({time:new Date().toISOString(),count:responseData.availableTasks})
           }else{
               console.log('Request succeed:'+responseData.availableTasks);
               writeLogToFile({time:new Date().toISOString(),count:responseData.availableTasks})
           }
        }

        if(data.status!==200){
           console.log('Request failed:'+data.status)
           writeLogToFile({time:new Date().toISOString(),count:-1000})
           shouldKeepRequesting = false;
        }

    } catch (error) {
        console.log('Request error.')
        shouldKeepRequesting = false;
    }
}


function startLoop() {
    sendRequest();
    setInterval(()=>{
        if(shouldKeepRequesting){
            sendRequest()
        }
    }, 10000);
}

startLoop();
