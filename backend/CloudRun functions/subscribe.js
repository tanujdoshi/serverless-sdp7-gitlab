const { Firestore } = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');
const axios = require('axios');

const firestore = new Firestore();

const API_GATEWAY_URL = "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/agent/getRandom";

async function fetchAgent() {
  try {
    const response = await axios.get(API_GATEWAY_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw new Error("Could not retrieve agent");
  }
}

functions.cloudEvent('helloPubSub', async (cloudEvent) => {
  const base64name = cloudEvent.data.message.data;

  const name = base64name
      ? Buffer.from(base64name, 'base64').toString()
      : 'World';

  const data = JSON.parse(name);

  console.log(`Hello, ${name}!`);

  try {
    const { name, email, referenceId, concernText } = data;

    const agentData = await fetchAgent();

    // Firestore reference for the 'Concerns' collection
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