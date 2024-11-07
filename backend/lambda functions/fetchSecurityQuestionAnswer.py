import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Users') 
table = dynamodb.Table('UserSecurityQuestions')  
def lambda_handler(event, context):
    print(event)
    email = event['email']
    if not email:
        return{
            "statusCode": 400,
            "body": json.dumps({"error":"Email is required"})
        }
    try:
        response = table.get_item(Key={'userId':email})

        if 'Item' not in response:
            return{
                "statusCode": 404,
                "body": json.dumps({"error": "User not found"})
            }
        user_data = response['Item']
        return {
            "statusCode": 200,
            "body": json.dumps({
                "success": True,
                "question1": user_data['question1'],
                "answer1": user_data["answer1"]
            })
        }
    except ClientError as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal Server Error", "message": str(e)})
        }

