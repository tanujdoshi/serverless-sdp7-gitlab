import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
    const userEmail = event.userEmail;

    const baseTopicName = 'UserRegistration-';
    const userTopicName = `${baseTopicName}${userEmail.replace('@', '-').replace('.', '-')}`;

    const userTopicArn = `arn:aws:sns:us-east-1:674942418091:${userTopicName}`;

    const params = {
        Message: "Welcome Back! You have successfully logged in to your QuickDataProcessor account.",
        Subject: "You're In! QuickDataProcessor Login Successful!",
        TopicArn: userTopicArn,
    };

    try {
        await sns.publish(params).promise();
        console.log(`Login notification sent to: ${userEmail}`);

        return { statusCode: 200, body: "Login notification sent to user." };

    } catch (error) {
        console.error('Error sending login notification:', error);
        return { statusCode: 500, body: "Failed to send login notification." };
    }
};