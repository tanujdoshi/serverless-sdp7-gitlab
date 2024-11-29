const { SessionsClient } = require('@google-cloud/dialogflow');
const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const firestore = new Firestore();

function extractProcessId(concern) {
    const match = concern.match(/processid:\s*(.+)/i);
    return match ? match[1].trim() : null; 
}

async function storeConcernInFirestore(userEmail, concern, processId) {
    const concernId = uuidv4();
    try {
        await firestore.collection('customer_concerns').doc(concernId).set({
            userEmail: userEmail,
            concern: concern,
            processId: processId,
            timestamp: new Date().toISOString(),
        });
        console.log("Concern stored successfully in Firestore");
    } catch (error) {
        console.error("Error storing concern in Firestore:", error);
        throw new Error("Failed to store concern");
    }
}

async function checkProcessStatus(processId) {
    const url = `https://5pagobq5q7qvtqaihuenpgeqce0szyyw.lambda-url.us-east-1.on.aws/?process_id=${processId}`;
    try {
        console.log(url)
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching process status:", error);
        throw new Error("Failed to fetch process status");
    }
}

exports.handleRequest = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  
    if (req.method === 'OPTIONS') {
        return res.status(204).end(); 
    }
    const userMessage = req.body.message;
    const userEmail = req.body.email;

    if (!userMessage || !userEmail) {
        return res.status(400).json({ error: "Invalid request body format. 'message' and 'email' are required." });
    }

    const processId = extractProcessId(userMessage);


    if (/status|check|track/i.test(userMessage) && processId) {
        try {
            const processStatus = await checkProcessStatus(processId);
            return res.status(200).json({ reply: processStatus });
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch process status" });
        }
    }

    if (/concern|issue|help|support/i.test(userMessage)) {
        try {
            await storeConcernInFirestore(userEmail, userMessage, processId);
            return res.status(200).json({ reply: "Thank you, we will get back to you." });
        } catch (error) {
            return res.status(500).json({ error: "Failed to store concern" });
        }
    }

    const sessionId = uuidv4();
    const projectId = 'serverless-441618';
    const languageCode = '.env';

    const sessionClient = new SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userMessage,
                languageCode: languageCode,
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        return res.status(200).json({ reply: result.fulfillmentText });
    } catch (error) {
        console.error('Error communicating with Dialogflow:', error);
        return res.status(500).json({ error: 'Error connecting to Dialogflow' });
    }
};
