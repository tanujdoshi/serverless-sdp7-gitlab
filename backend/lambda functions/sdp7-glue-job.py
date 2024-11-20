import boto3
import json
import os

glue_client = boto3.client('glue')


def lambda_handler(event, context):
    body = event['body']
    user_email = body['user_email']
    s3_location = body['s3_location']

    if not user_email or not s3_location:
        return {
            'statusCode': 400,
            'body': json.dumps('Error: Missing user email or S3 location')
        }


    
    try:
        response = glue_client.start_job_run(
            JobName='json-to-csv',
            Arguments={
                '--s3_input_key': s3_location,
                '--s3_bucket': "sdp7-source-bucket",
                '--userEmail': user_email
            }
        )
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Glue job started successfully',
                'job_run_id': response['JobRunId']
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error starting Glue job: {str(e)}')
        }
