import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
    const params = {
        Message: "Hello and Welcome! We're excited to have you join the QuickDataProcessor community! Your registration was successful, and you are now set to explore the features that will enhance your data processing experience.",
        Subject: "Welcome Aboard! Your QuickDataProcessor Registration is Complete!",
        TopicArn: "arn:aws:sns:us-east-1:674942418091:UserNotifications"
    };

    try {
        await sns.publish(params).promise();
        return { statusCode: 200, body: "Registration notification sent." };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: "Failed to send notification." };
    }
};
