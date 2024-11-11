import boto3
import json
from boto3.dynamodb.conditions import Attr
from decimal import Decimal

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    
    table_name = 'sdp-glue-process'
    table = dynamodb.Table(table_name)
    email = event.get('queryStringParameters', {}).get('email')
    type_value = event.get('queryStringParameters', {}).get('type')  # Get type from query string
    print(json.dumps(event))

    try:
        # Using scan with a filter expression to match both email and type attributes
        response = table.scan(
            FilterExpression=Attr('userEmail').eq(email) & Attr('type').eq(type_value)  # Filter for both email and type
        )
        
        data = response['Items']

        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('userEmail').eq(email) & Attr('type').eq(type_value),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            data.extend(response['Items'])
        
        # Use the custom decimal_default function for JSON serialization
        return {
            'statusCode': 200,
            'body': json.dumps(data, default=decimal_default)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
