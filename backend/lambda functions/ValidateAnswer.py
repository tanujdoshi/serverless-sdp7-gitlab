import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MathQuestions')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    user_id = body.get('user_id', None)
    submitted_answer = body.get('submitted_answer', None)

    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing user_id in request body.')
        }

    if not submitted_answer:
        return {
            'statusCode': 400,
            'body': json.dumps('No answer provided.')
        }

    response = table.get_item(Key={'user_id': user_id})
    
    if 'Item' in response:
        stored_answer = response['Item']['answer']

        if int(submitted_answer) == int(stored_answer):
            return {
                'statusCode': 200,
                'body': json.dumps('Correct! Access granted.')
            }
        else:
            return {
                'statusCode': 403,
                'body': json.dumps('Incorrect answer. Access denied.')
            }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('No valid math question found or it has expired.')
        }
