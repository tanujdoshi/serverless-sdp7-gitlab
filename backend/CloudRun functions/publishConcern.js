const { PubSub } = require('@google-cloud/pubsub');
const functions = require('@google-cloud/functions-framework');
const cors = require('cors');

const corsHandler = cors({ origin: true });

const pubsub = new PubSub();

functions.http('helloHttp', async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { name, email, referenceId, concernText } = req.body;

      if ( !name || !email || !referenceId || !concernText) {
        return res.status(400).send('All fields are required.');
      }

      const concernPayload = JSON.stringify({
        name,
        email,
        referenceId,
        concernText,
      });

      const topicName = 'projects/serverless-project-439901/topics/raise-concerns';
      const messageId = await pubsub.topic(topicName).publish(Buffer.from(concernPayload));

      console.log(`Message ${messageId} published.`);
      res.status(200).send(`Concern published with message ID: ${messageId}`);
    } catch (error) {
      console.error('Error publishing message:', error);
      res.status(500).send('Error publishing concern.');
    }
  });
});