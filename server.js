// server.js
import express from 'express';
import path from 'path';
import { writeFile,readFile} from 'fs/promises';

const logsFilePath =  'logs.txt';
const fetchOptionsFilePath = 'options.json';

async function writeJsonToFile(json) {
    try {
        await writeFile(fetchOptionsFilePath,  json);
        console.log('File successfully updated');
    } catch (err) {
        console.error('Error writing file:', err);
    }
}

// Initialize the Express app
const app = express();

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.resolve('index.html'));
});

// Handle the form submission
app.post('/submit', (req, res) => {
    const { key, value } = req.body;

    if(key!=="Lmhezk@#MWapp"){
        res.send(`Wrong key.`);
    }

    writeJsonToFile(value)

    res.send(`Updated.`);
});
app.get('/log', async (req, res) => {
    try {
        // Read the file content
        const fileContent = await readFile(logsFilePath, 'utf-8');

        const objects = splitIntoJsonObjects(fileContent);

        // Get the last 10 objects
        const last10Objects = objects.slice(-5).reverse();

        // Send the response as JSON
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Monkey Log</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    pre {
                        background-color: black;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                        white-space: pre-wrap;
                        color: gray;
                    }
                </style>
            </head>
            <body style="background-color: black">
                <pre>${JSON.stringify(last10Objects, null, 2)}</pre>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


function splitIntoJsonObjects(fileContent) {
    const jsonObjects = [];
    let currentObject = '';
    let inObject = false;

    // Split the content by line breaks and process each line
    const lines = fileContent.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '{') {
            inObject = true;
            currentObject = '{';
        } else if (trimmedLine === '}') {
            if (inObject) {
                currentObject += '}';
                jsonObjects.push(currentObject);
                inObject = false;
                currentObject = '';
            }
        } else if (inObject) {
            currentObject += `\n${trimmedLine}`;
        }
    }

    // Parse JSON objects
    return jsonObjects.map(obj => JSON.parse(obj));
}