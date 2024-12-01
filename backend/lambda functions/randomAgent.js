import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const params = {
    TableName: "User",
    FilterExpression: "#role = :agentRole",
    ExpressionAttributeNames: {
      "#role": "role",
    },
    ExpressionAttributeValues: {
      ":agentRole": "Agent",  
    },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    const agents = result.Items;

    if (agents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No agents found" }),
      };
    }

    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    return {
      statusCode: 200,
      body: JSON.stringify(randomAgent),
    };
  } catch (error) {
    console.error("Error fetching agent:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching agent" }),
    };
  }
};