import boto3
import json
import os
import time
import uuid

glue_client = boto3.client('glue')
sqs = boto3.client('sqs')
dynamodb = boto3.resource('dynamodb')


queue_url = "https://sqs.us-east-1.amazonaws.com/876388743639/process-queue-job"

def lambda_handler(event, context):
    # Poll Each SQS
    for record in event['Records']:
        message_body = json.loads(record['body'])
        user_email = message_body['user_email']
        s3_location =  message_body['s3_location']
        bucket = "sdp7-source-bucket"

        table = dynamodb.Table('sdp-glue-process') 
        process_id = str(uuid.uuid4())

        print("s3_location")
        print(s3_location)
        output_path = s3_location.replace('/input/', '/output/').replace('.json', '.csv')
        print("output_path")
        print(output_path)
        region = 'us-east-1'
        output_downloadable_link = f"https://{bucket}.s3.{region}.amazonaws.com/{output_path.split('s3://'+bucket+'/')[1]}"
        print("output_downloadable_link")
        print(output_downloadable_link)

        process_id = str(uuid.uuid4())
        filename = s3_location.split('/')[-1]

        timestamp = int(time.time())
        dynamodb_item_initial = {
            'process_id': process_id,
            'userEmail': user_email,
            'filename': filename,
            's3_inputLocation': s3_location,
            'timestamp': timestamp,
            'status': "in_progress",
            'output_downloadable_link': "",
            'type': 'glue'
        }
        table.put_item(Item=dynamodb_item_initial)

        # Process Glue Job

        try:
            response = glue_client.start_job_run(
                JobName='json-to-csv',
                Arguments={
                    '--s3_input_key': s3_location,
                    '--s3_bucket': "sdp7-source-bucket",
                    '--userEmail': user_email,
                    '--process_id': process_id
                }
            )

            print("response['JobRunId']")
            print(response['JobRunId'])

        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps(f'Error starting Glue job: {str(e)}')
            }



        print("Started Called 123123")
        print(s3_location)
        print("!!!!!!!!!!!!!")
        print(user_email)

    return {"statusCode": 200, "body": "Glue job triggered successfully"}