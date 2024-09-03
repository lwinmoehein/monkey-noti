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
                "cookie": "_appen_auth_session=mkXYUZ9fELXCEc4PAPNnkxSXnbFIi0FJ; Authorization=eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNqMUMFqwzAM_Red4xLbSWPn1EEpDHYalEFuTqw27hrH1GkzWvod-5l9zj5kypZDj3sgHZ70pCfdIJ5rKOEpBPTfX59MpIKnmisKLlWRL5nFy-I4OrbvDCTQ9Bah5EIl4CwJldJ2t5PIlKmRZdZoprhWzEiJS5mJwtYpySLG6Hr_PEk24zpedRhfDm2O1VbXb9dKn1-r7XvrPPdI7fgRaEkh8izXUmcJXPA06aEUtNcMczHlxVQcZid_YBnhITUPoNGHwf3fdjj1IUJ5g-BNR3cDPcJ3_a_FzrgjMfN7JrZF51f7iV80fQf3-w8AAAD__w.xPA7-3NkbuUxFmx-qWVc8grUdeH0kmEKNRHqfBQ-STg",
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
               console.log('Request succeed, message sent.');
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
