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
const takerUrlFilePath =  'taker.txt';
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
async function getCheckerFetchOptions() {
    // Read the JSON file
    const data = await fs.readFile(fetchOptionsFilePath, 'utf-8');

    // Parse the JSON data into a JavaScript object
    return JSON.parse(data);
}


function getTakerUrl() {
    return "https://ui.appen.com.cn/ssr/v3/qa-task-start?jobId=d38534ce-7e1a-4707-b905-39e06abfe4ed&jobType=QA&isPublic=true&locale=en-US&flowId=a20f6d41-3a53-45a2-a3b8-a9cdbe717577&jobTenantId=aaaaaaaa-pppp-pppp-eeee-nnnnnnnnnnnn&title=ASR%20Burmese%20M5%201%20Round%20QA&projectId=30ccc3b5-cda3-4f74-838f-edb915a3610b&projectDisplayId=A9887&businessType=WORK";  
}

async function getFetchData() {
    // Read the JSON file
    return await fs.readFile(fetchOptionsFilePath, 'utf-8');
}



async function sendMessage(msg='Jobs found, Hurry!') {
    const token = '7273799390:AAFcptLnAtvmR4aVNL4APxW-IUt8rL2C8_4';
    const chatId = -4553980792;
    const message = msg;

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
        const options = await getCheckerFetchOptions();

        const response = await fetch("https://ui.appen.com.cn/api-gw/project/v3/job/worker-records", options);

        const data = await response.json();

        if(data.status===200){
           const responseData = data.data;
           if(responseData.availableTasks>0){
               console.log('Request succeed, message sent:'+JSON.stringify(responseData));
               await takeTask();
               await sendMessage();
               await writeLogToFile({time:getDubaiTime(new Date().toISOString()),count:responseData.availableTasks});
           }else{
               console.log('Request succeed:'+responseData.availableTasks);
               await writeLogToFile({time:getDubaiTime(new Date().toISOString()),count:responseData.availableTasks})
           }
        }

        if(data.status!==200){
           console.log('Request failed:'+data.status)
           await writeLogToFile({time: getDubaiTime(new Date().toISOString()), count: -1000})
           shouldKeepRequesting = false;
           sendFailMessage()
        }
        const newFetchData = await getFetchData();
        lastCheckSum = calculateHash(newFetchData);
    } catch (error) {
        console.log('Request error.');
        await writeLogToFile({time:getDubaiTime(new Date().toISOString()),message:"check request failed"});
        shouldKeepRequesting = false;
        //sendFailMessage()
    }
}
async function takeTask() {
    try {
        let takerOptions = {};
        takerOptions.headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "cache-control": "max-age=0",
            "if-none-match": "W/\"5f0-3Lu0tZ5AaTYbpoZNF+wadUZjcig\"",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        };

        let checkerOptions = await getCheckerFetchOptions(); 
        takerOptions.method = "GET";
        takerOptions.referrerPolicy = "strict-origin-when-cross-origin";
        takerOptions.body = null;
        takerOptions.headers.cookie = checkerOptions.headers.cookie;
      
        const takerUrl =  getTakerUrl();

        const response = await fetch(takerUrl, takerOptions);

        if(response.ok){
            console.log('Horray !!! monkey had taken a task.');
            sendMessage('Horray !!! monkey had taken a task.');
        } else {
           if(response.status==304){
            console.log('tried to take task but no task found.');
            await writeLogToFile({time: getDubaiTime(new Date().toISOString()),message:"tried to take task but not task found."})
           }
        }
    
    } catch (error) {
            console.log('Error !!! error while taking available task.');
            sendMessage('Error !!! error while taking available task.');
    }
}

function sendFailMessage(){
    sendMessage("Monkey noti stopped. ( First warning )");

    setTimeout(()=>{
        sendMessage("Monkey noti stopped. ( Second warning )");
    },30000);
}


function startLoop() {
    setInterval(async () => {
        await takeTask();
    }, 3000);
}

startLoop();
