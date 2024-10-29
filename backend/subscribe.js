const { Firestore } = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');

const firestore = new Firestore();


functions.cloudEvent('helloPubSub', cloudEvent => {
  const base64name = cloudEvent.data.message.data;

  const name = base64name
    ? Buffer.from(base64name, 'base64').toString()
    : 'World';

  const data = JSON.parse(name);

  console.log(`Hello, ${name}!`);

  try {
    console.log("data::::::::::::::::::::::::::::::"+data);
    const { customerId, name, email, refrenceCode, concernText } = data;
    console.log("customerId::::::::::::::::::::::::::::::"+customerId);

    // Static agent (for testing) 
    const agentId = "static-agent-id";
    const agentName = "Static Agent Name";
    const agentEmail = "agent@example.com";

    // Firestore reference for the 'Concerns' collection 
    const concernRef = firestore.collection('Concerns').doc();

    // schema
    const concernData = {
      customerId,
      concernId: concernRef.id,
      agentId,
      refrenceId: refrenceCode,
      concernText,
      agentName,
      agentEmail,
      customerName: name,
      customerEmail: email,
      isActive: true
    };

    concernRef.set(concernData)
      .then(() => {
        console.log(`Concern created in Firestore with ID: ${concernRef.id}`);
      })
      .catch((error) => {
        console.error('Error creating concern in Firestore:', error);
      });

    console.log(`Concern created in Firestore with ID: ${concernRef.id}`);
  } catch (error) {
    console.error('Error creating concern in Firestore:', error);
  }
});
