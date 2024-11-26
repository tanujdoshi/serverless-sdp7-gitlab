import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('UserSecurityQuestions')

def lambda_handler(event, context):
    try:
        user_id = event['userId']
        question1 = event['question1']
        answer1 = event['answer1']
        name = event['name']
        role = event['role']
        
        item = {
            'userId': user_id, 
            'question1': question1,
            'answer1': answer1,
            'name': name,
            'role': role
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Security questions saved successfully'})
        }
    
    except ClientError as e:
        print(f"Error storing security questions: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error saving security questions'})
        }
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An unexpected error occurred'})
        }
