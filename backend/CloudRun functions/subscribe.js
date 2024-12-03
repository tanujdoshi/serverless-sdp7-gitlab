const { Firestore } = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');
const axios = require('axios');

const firestore = new Firestore();

const API_GATEWAY_URL = "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/agent/getRandom";

async function fetchAgent() {
  try {
    const response = await axios.get(API_GATEWAY_URL);
    const agentData = JSON.parse(response.data.body);
    return agentData;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw new Error("Could not retrieve agent");
  }
}

functions.cloudEvent('helloPubSub', async (cloudEvent) => {
  const base64concernData = cloudEvent.data.message.data;

  const concernData = base64concernData
      ? Buffer.from(base64concernData, 'base64').toString()
      : 'World';

  const data = JSON.parse(concernData);

  console.log(`Hello, ${concernData}!`);

  try {
    const { name, email, referenceId, concernText } = data;

    const agentData = await fetchAgent();

    const concernRef = firestore.collection('Concerns').doc();

    const concernData = {
      concernId: concernRef.id,
      customerName: name,
      customerEmail: email,
      referenceId,
      concernText,
      agentName: agentData.name,
      agentEmail: agentData.userId,
    };

    await concernRef.set(concernData);
    console.log(`Concern created in Firestore with ID: ${concernRef.id}`);
  } catch (error) {
    console.error('Error creating concern in Firestore:', error);
  }
});