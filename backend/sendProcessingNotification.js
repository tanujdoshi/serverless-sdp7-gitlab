import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event) => {
    const processingStatus = event.status; 
    let message;
    let subject;

    if (processingStatus === 'success') {
        message = "Congratulations! Your file processing was completed successfully!";
        subject = "Great News! Your File Processing is Complete!";
    } else {
        message = "There was an error processing your file!";
        subject = "Oops! There was an error while processing your file.";
    }

    const params = {
        Message: message,
        Subject: subject,
        TopicArn: "arn:aws:sns:us-east-1:674942418091:FileProcessingNotifications"
    };

    try {
        await sns.publish(params).promise();
        return { statusCode: 200, status: processingStatus, body: "Processing notification sent." };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: "Failed to send processing notification." };
    }
};