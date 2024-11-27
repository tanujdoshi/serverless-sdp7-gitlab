import AWS from "aws-sdk";
import nlp from "compromise";
import crypto from "crypto";

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

function jsonToCsv(jsonArray) {
  const headers = Object.keys(jsonArray[0]);
  const csvRows = jsonArray.map((row) =>
    headers.map((header) => row[header]).join(",")
  );
  return [headers.join(","), ...csvRows].join("\n");
}

export const handler = async (event) => {
  try {
    const { user_email: userEmail, s3_location: s3Location } = event.body;

    // Extract bucket name and file key from s3_location
    const s3Params = s3Location.split("/");
    const bucketName = s3Params[2];
    const key = s3Params.slice(3).join("/");
    const fileName = key.split("/").pop();

    // Retrieve the file from S3
    const fileData = await s3
      .getObject({ Bucket: bucketName, Key: key })
      .promise();
    const fileText = fileData.Body.toString("utf-8");

    // Use NLP to extract named entities
    const doc = nlp(fileText);
    const entities = [
      ...doc
        .people()
        .out("array")
        .map((name) => ({ Type: "Person", Text: name })),
      ...doc
        .places()
        .out("array")
        .map((place) => ({ Type: "Place", Text: place })),
      ...doc
        .organizations()
        .out("array")
        .map((org) => ({ Type: "Organization", Text: org })),
    ];

    // const csvData = stringify(entities, { header: true });
    const csvData = jsonToCsv(entities);
    const csvFileName = `output/${crypto.randomUUID()}.csv`;
    const csvParams = {
      Bucket: bucketName,
      Key: csvFileName,
      Body: csvData,
      ContentType: "text/csv",
    };

    await s3.putObject(csvParams).promise();
    const csvUrl = `https://${bucketName}.s3.amazonaws.com/${csvFileName}`;

    const currentTimestamp = new Date().toISOString();

    const params = {
      TableName: "sdp-glue-process",
      Item: {
        process_id: crypto.randomUUID(),
        userEmail: userEmail,
        s3_inputLocation: s3Location,
        entities: entities,
        type: "txt",
        status: "Completed",
        output_downloadable_link: csvUrl,
        timestamp: currentTimestamp,
        filename: fileName,
      },
    };

    await dynamodb.put(params).promise();

    // Return response with success message
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Named entities extracted and saved to DynamoDB successfully.",
        user_email: userEmail,
        s3_location: s3Location,
        entities: entities,
      }),
    };
  } catch (error) {
    console.error(
      "Error processing file:",
      error.message || JSON.stringify(error)
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Error processing file.",
      }),
    };
  }
};
