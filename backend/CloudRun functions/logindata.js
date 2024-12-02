const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const { BigQuery } = require('@google-cloud/bigquery');

const firestore = new Firestore();
const bigquery = new BigQuery();

functions.http('logUserLogin', async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send(''); 
  }
  
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).send('Missing paramaters in request.');
    }

    const now = new Date().toISOString();

    // Update Firestore
    const userRef = firestore.collection('loginStats').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      const loginData = doc.data();
      await userRef.update({
        loginCount: loginData.loginCount + 1,
        lastLogin: now,
        role: role,
      });
    } else {
      await userRef.set({
        loginCount: 1,
        lastLogin: now,
        role: role,
      });
    }

    // Update BigQuery
    const datasetId = 'jayp27154login';
    const tableId = 'loginstats';

    const query = `
      MERGE \`${datasetId}.${tableId}\` AS target
      USING (SELECT "${email}" AS email, "${role}" AS role, "${now}" AS lastLogin) AS source
      ON target.email = source.email
      WHEN MATCHED THEN
        UPDATE SET target.loginCount = target.loginCount + 1, target.lastLogin = source.lastLogin, target.role = source.role
      WHEN NOT MATCHED THEN
        INSERT (email, loginCount, lastLogin, role) VALUES (source.email, 1, source.lastLogin, source.role)
    `;

    await bigquery.query(query);

    res.status(200).send(`Login stats updated for ${email}`);
  } catch (error) {
    console.error('Error updating login stats:', error);
    res.status(500).send('Error updating login stats');
  }
});
