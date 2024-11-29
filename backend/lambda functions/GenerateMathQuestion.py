import boto3
import time
import random
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MathQuestion')

def lambda_handler(event, context):
    user_id = event.get('queryStringParameters', {}).get('user_id', None)
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            'body': json.dumps({"error": "Missing or invalid user_id"})
        }

    current_time = int(time.time())  

    try:
        num1, num2, operation, answer = generate_math_question()
        question = f"What is {num1} {operation} {num2}?"

        
        expiration_time = current_time + 300  

        table.put_item(
            Item={
                'userid': user_id,
                'question': question,
                'answer': answer,
                'ttl': expiration_time
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            'body': json.dumps({'question': question})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            'body': json.dumps(f"Error occurred: {str(e)}")
        }

def generate_math_question():
    try:
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        operation = random.choice(['+', '-', '*'])
        
        if operation == '+':
            answer = num1 + num2
        elif operation == '-':
            answer = num1 - num2
        elif operation == '*':
            answer = num1 * num2

        return num1, num2, operation, answer
    except Exception as e:
        raise RuntimeError(f"Failed to generate math question: {str(e)}")
