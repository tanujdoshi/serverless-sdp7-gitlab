const { PubSub } = require('@google-cloud/pubsub');
const functions = require('@google-cloud/functions-framework');

const pubsub = new PubSub();

functions.http('helloHttp', async (req, res) => {
  try {
    const { customerId, name, email, refrenceCode, concernText } = req.body;

    if (!customerId || !name || !email || !refrenceCode || !concernText) {
      return res.status(400).send('All fields are required.');
    }

    const messagePayload = JSON.stringify({
      customerId,
      name,
      email,
      refrenceCode,
      concernText,
    });

    const topicName = 'projects/serverless-project-439901/topics/raise-concerns';
    const messageId = await pubsub.topic(topicName).publish(Buffer.from(messagePayload));

    console.log(`Message ${messageId} published.`);
    res.status(200).send(`Concern published with message ID: ${messageId}`);
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).send('Error publishing concern.');
  }
});