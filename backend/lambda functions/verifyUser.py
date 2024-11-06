import boto3
import os
import json

cognito = boto3.client('cognito-idp')

def lambda_handler(event, context):
    user_pool_id = os.environ['USER_POOL_ID']  

    params = {
        'UserPoolId': user_pool_id,
        'Username': event['email'],
        'UserAttributes': [
            {
                'Name': 'email_verified',
                'Value': 'true',
            },
        ],
    }

    try:
        cognito.admin_update_user_attributes(**params)
        
        # Confirm the user's signup
        confirm_params = {
            'UserPoolId': user_pool_id,
            'Username': event['email'],
        }
        cognito.admin_confirm_sign_up(**confirm_params)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'status': "Success",
                'message': f"User {event['email']} has been successfully verified."
            })
        }
    except Exception as error:
        print(f"Error verifying user: {str(error)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'status': "Failure",
                'message': f"Error verifying user {event['email']}.",
                'error': str(error)
            })
        }
