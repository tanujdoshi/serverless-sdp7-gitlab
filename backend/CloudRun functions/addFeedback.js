
functions.http('addfeedback', async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).send(''); // Send an empty response for preflight requests
    }
  
    try {
  
      const { feed, userEmail, dpType, fileName } = req.body;
  
      if (!feed) {
        return res.status(400).send('Missing required fields');
      }
  
      const document = {
        content: feed,
        type: 'PLAIN_TEXT',
      };
  
  
      const [sentimentResult] = await languageClient.analyzeSentiment({ document });
      const { score, magnitude } = sentimentResult.documentSentiment;
  
      const usersRef = firestore.collection('feed1').doc();
      const userData = {
        'userEmail': userEmail,
        'filename': fileName,
        'type': dpType,
        'feedback': feed,
        'score': score,
      };
  
      await usersRef.set(userData);
  
      res.json({ result: `Feedback with ID ${usersRef.id} added.` });
    } catch (error) {
    
      console.error('Error adding feedback:', error);
      res.status(500).send('Error adding feedback');
    }
  });