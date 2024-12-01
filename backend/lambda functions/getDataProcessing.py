import json
import urllib3

def lambda_handler(event, context):
    # Create a PoolManager object to manage HTTP connections
    http = urllib3.PoolManager()
    url = "https://kdhprlykjeacymoqef22co3ie40unnqa.lambda-url.us-east-1.on.aws/"
    
    try:
        # Send a GET request to the URL and retrieve the response
        response = http.request('GET', url)
        data = json.loads(response.data.decode('utf-8'))

        # Get userEmail from API input
        user_email = event.get('userEmail', None)

        if not user_email:
            return {
                'statusCode': 400,
                'body': json.dumps({"message": "userEmail is required"})
            }
        
        filtered_tasks = [task for task in data if task['userEmail'] == user_email]

        return {
            'statusCode': 200,
            'body': json.dumps(filtered_tasks)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
