import functions_framework
from google.cloud import storage, firestore, bigquery
from wordcloud import WordCloud
import io
import json
from collections import Counter
from flask import jsonify
import uuid
from datetime import datetime


@functions_framework.http
def hello_http(request):
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
        return ("", 204, headers)

    try:
        # Ensure the file exists in the request
        uploaded_file = request.files.get("file")
        user_email = request.form.get("email")  # Use `form.get` for text data
        if not uploaded_file or not user_email:
            return jsonify({"error": "File and Email are required!"}), 400

        # Generate a random process ID
        process_id = str(uuid.uuid4())

        # Extract file name and upload it to Cloud Storage
        file_name = uploaded_file.filename
        bucket_name = "sdp7-wordcloud"

        # Initialize the Cloud Storage client
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)

        # Upload input file
        input_blob_path = f"uploads/{file_name}"
        blob = bucket.blob(input_blob_path)
        blob.upload_from_file(uploaded_file)
        input_location = blob.public_url  # Get a public link to the file

        # Generate word cloud
        text_content = blob.download_as_text()
        wordcloud_path = f"wordclouds/{file_name.split('/')[-1]}.png"
        generate_wordcloud(text_content, bucket_name, wordcloud_path)

        # Get output downloadable link
        output_blob = bucket.blob(wordcloud_path)
        output_downloadable_link = output_blob.public_url

        # Parse word frequencies and upload to BigQuery
        word_frequencies = parse_word_frequencies(text_content)
        upload_to_bigquery(word_frequencies, user_email, file_name)


        # Store metadata in Firestore
        store_user_info(
            process_id=process_id,
            user_email=user_email,
            input_location=input_location,
            file_name=file_name,
            output_downloadable_link=output_downloadable_link,
        )

        # Return success response with CORS headers
        headers = {
            "Access-Control-Allow-Origin": "*",
        }
        return jsonify({
            "message": f"File {file_name} uploaded successfully!",
            "process_id": process_id,
            "input_location": input_location,
            "output_downloadable_link": output_downloadable_link
        }), 200, headers

    except Exception as e:
        # Catch any exceptions and return an error response
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


def parse_word_frequencies(text):
    # Parse text into word frequencies (simplified example)
    from collections import Counter
    words = text.split()
    return Counter(words)


def generate_wordcloud(text, bucket_name, output_path):
    from google.cloud import storage
    from wordcloud import WordCloud
    import matplotlib.pyplot as plt
    import io

    # Generate word cloud
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')

    # Save the image to a buffer
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)

    # Upload word cloud to Cloud Storage
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(output_path)
    blob.upload_from_file(buffer, content_type='image/png')
    print(f"Word cloud saved to {bucket_name}/{output_path}.")


def upload_to_bigquery(word_frequencies, user_email, file_name):
    from google.cloud import bigquery

    bigquery_client = bigquery.Client()
    table_id = "csci-5410-439301.wordcloud_dataset.wordcloud"

    rows_to_insert = [
        {
            "word": word,
            "frequency": freq,
            "user_id": user_email,
            "file_id": file_name
        }
        for word, freq in word_frequencies.items()
    ]

    # Insert rows into BigQuery
    errors = bigquery_client.insert_rows_json(table_id, rows_to_insert)
    if errors:
        print(f"BigQuery insertion errors: {errors}")
    else:
        print("Word frequencies uploaded to BigQuery.")



def store_user_info(process_id, user_email, input_location, file_name, output_downloadable_link):
    db = firestore.Client()
    doc_ref = db.collection('wordcloud').document(process_id)
    current_timestamp = datetime.utcnow()

    doc_ref.set({
        'process_id': process_id,
        'userEmail': user_email,
        'inputLocation': input_location,
        'filename': file_name,
        'status': 'Completed',
        'output_downloadable_link': output_downloadable_link,
        'timestamp': current_timestamp.isoformat(),
    }, merge=True)
