const { SessionsClient } = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');


async function checkProcessStatus(processId) {
    const url = `https://5pagobq5q7qvtqaihuenpgeqce0szyyw.lambda-url.us-east-1.on.aws/?process_id=${processId}`;
    console.log("Checking process status for Process ID:", processId);
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching process status:", error);
        throw new Error("Failed to fetch process status");
    }
}

function formatProcessStatusResponse(processStatus) {
    if (!processStatus || !processStatus.status) {
        return "Unable to fetch the process status at the moment.";
    }
    console.log(processStatus)
    const { filename, process_id, status, output_downloadable_link } = processStatus;
    console.log(processStatus)


    if (!filename || !process_id) {
        return "Essential details like filename or Process ID are missing.";
    }


    switch (status.toLowerCase()) {
        case "in_progress":
            return `The process for the file "${filename}" (Process ID: ${process_id}) is currently in progress. Please check back later for updates.`;
        
        case "completed":
            if (output_downloadable_link) {
                return `The process for the file "${filename}" (Process ID: ${process_id}) is completed. You can download the output from the following link: ${output_downloadable_link}`;
            } else {
                return `The process for the file "${filename}" (Process ID: ${process_id}) is completed, but no output link is available.`;
            }
        
        case "error":
            return `The process for the file "${filename}" (Process ID: ${process_id}) encountered an error. Please contact support for further assistance.`;
        
        default:
            return `The process for the file "${filename}" (Process ID: ${process_id}) is in an unknown state ("${status}"). Please contact support for more details.`;
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

    const sessionId = uuidv4();
    const projectId = 'serverless-441618';
    const languageCode = 'en';

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

        const intentName = result.intent.displayName;
        const parameters = result.parameters.fields;

        const processId = parameters.processId?.listValue?.values?.[0]?.stringValue || null;

        if (intentName === 'processingfile' && processId) {
            try {
                const processStatus = await checkProcessStatus(processId);

                const formattedResponse = formatProcessStatusResponse(processStatus);
                return res.status(200).json({ reply: formattedResponse });
            } catch (error) {
                console.error('Error checking process status:', error);
                return res.status(500).json({ error: "Failed to fetch process status" });
            }
        }

        return res.status(200).json({ reply: result.fulfillmentText });
    } catch (error) {
        console.error('Error communicating with Dialogflow:', error);
        return res.status(500).json({ error: 'Error connecting to Dialogflow' });
    }
};

