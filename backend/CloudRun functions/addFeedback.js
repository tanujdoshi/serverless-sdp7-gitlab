/**
 * Cloud Function to add user feedback.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
functions.http('addfeedback', async (req, res) => {
    // Add CORS headers to the response
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).send(''); // Send an empty response for preflight requests
    }
  
    try {
      // Extract required fields from the request body
      const { feed, userEmail, dpType, fileName } = req.body;
  
      // Validate required fields
      if (!feed) {
        return res.status(400).send('Missing required fields');
      }
  
      // Create a document for sentiment analysis
      const document = {
        content: feed,
        type: 'PLAIN_TEXT',
      };
  
      // Analyze the sentiment of the feedback
      const [sentimentResult] = await languageClient.analyzeSentiment({ document });
      const { score, magnitude } = sentimentResult.documentSentiment;
  
      // Create a new document in Firestore
      const usersRef = firestore.collection('feed1').doc();
      const userData = {
        'userEmail': userEmail,
        'filename': fileName,
        'type': dpType,
        'feedback': feed,
        'score': score,
      };
  
    
      await usersRef.set(userData);
  
      // Log the result
      console.log(`Concern created in Firestore with ID: ${usersRef.id}`);
  
      // Return a success response
      res.json({ result: `Feedback with ID ${usersRef.id} added.` });
    } catch (error) {
     
      console.error('Error adding feedback:', error);
  
      // Return an error response
      res.status(500).send('Error adding feedback');
    }
  });