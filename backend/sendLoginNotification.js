import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
    const params = {
        Message: "Welcome Back! You have successfully logged in to your QuickDataProcessor account.",
        Subject: "You're In! QuickDataProcessor Login Successful!",
        TopicArn: "arn:aws:sns:us-east-1:674942418091:UserNotifications"
    };
    
    try {
        await sns.publish(params).promise();
        return { statusCode: 200, body: "Login notification sent." };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: "Failed to send login notification." };
    }
};
