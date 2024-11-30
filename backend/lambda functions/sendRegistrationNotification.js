import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
    const userEmail = event.userEmail;
    const baseTopicName = 'UserRegistration-';
    const userTopicName = `${baseTopicName}${userEmail.replace('@', '-').replace('.', '-')}`;

    const createTopicParams = {
        Name: userTopicName,
    };

    try {
        const createTopicResponse = await sns.createTopic(createTopicParams).promise();
        const userTopicArn = createTopicResponse.TopicArn;

        console.log('User topic created:', userTopicArn);

        const subscribeParams = {
            Protocol: 'email',
            Endpoint: userEmail,
            TopicArn: userTopicArn,
        };

        const subscribeResponse = await sns.subscribe(subscribeParams).promise();
        console.log('User subscribed to the topic:', subscribeResponse);


        const messageParams = {
            Message: "Hello and Welcome! We're excited to have you join the QuickDataProcessor community! Your registration was successful.",
            Subject: "Welcome Aboard! Your QuickDataProcessor Registration is Complete!",
            TopicArn: userTopicArn,
        };

        await sns.publish(messageParams).promise();
        console.log('Notification sent to user:', userEmail);

        return { statusCode: 200, body: "Registration notification sent to user." };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: "Failed to send notification to user." };
    }
};