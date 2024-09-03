import fetch from "node-fetch";

let shouldKeepRequesting = true;

async function sendMessage() {
    const token = '7273799390:AAFcptLnAtvmR4aVNL4APxW-IUt8rL2C8_4'; // Replace with your bot token
    const chatId = -4553980792; // Replace with the chat ID or username
    const message = 'Jobs found, Hurry!'; // Message to send

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
        const response = await fetch("https://ui.appen.com.cn/api-gw/project/v3/job/worker-records", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json;charset=UTF-8",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": "_appen_auth_session=bDJKEZTjtYB6xHpq2fczkKycRMql30Uk; Authorization=eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNqMUEFuwjAQ_MueMYrtOHFyKkKCVhVFFPUBTrxQI5xYJE0qId7Rz_Q5fUjXggNHRvIeZnd2xnuG7quCEmYhYPP3-8NEInhScE2PS52rjFkcpsfRsb03MIG6tQglF3oCzpJQ68LudhKZNhWy1JqCaV5oZqTETKYit1VCsg67zrXNS5Rs3-evm-e3cTVsvFofVouRZ9lSS-WH2fZjPadx_A5kkguVqkQq8hrwFPVQCvI1_bUpC5HHZn9LcgVLCXelvgOtPvTu8djh1IYOyjOExnj6N9AhGt9ijOiNOxJzO09kP9E1T_vIT-vWw-XyDwAA__8.x_Ah1smWMxl8anaOG2fu9iuzHspZNHiIhyMwFKQZFn4",
                "Referer": "https://ui.appen.com.cn/v3/worker-job/fab25fee-b440-4031-98de-78fd60e0d1c7?businessType=WORK&from=Ii92My93b3JrZXItam9icy90YXNrcy9pbi1wcm9ncmVzcz9wYWdlSW5kZXg9MSZqb2JOYW1lPSZwYWdlU2l6ZT0xMCI%3D&projectId=30ccc3b5-cda3-4f74-838f-edb915a3610b",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "{\"pageSize\":10,\"pageIndex\":0,\"recordIdList\":null,\"jobId\":\"fab25fee-b440-4031-98de-78fd60e0d1c7\",\"jobType\":\"QA\",\"projectId\":\"30ccc3b5-cda3-4f74-838f-edb915a3610b\"}",
            "method": "POST"
        });

        const data = await response.json();

        if(data.status===200){
           const responseData = data.data;
           if(responseData.availableTasks>0 || responseData.results.length>0 || responseData.batchNumList.length>0 || responseData.totalElements>0){
               sendMessage();
           }else{
               console.log('Request succeed.');
           }
        }

        if(data.status!==200){
           console.log('Request failed.')
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
    }, 60000);
}

startLoop();
