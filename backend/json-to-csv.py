import sys
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.transforms import *


# AWS Glue job parameters
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

# Spark and Glue context
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Source and destination paths in S3
input_path = "s3://sdp7-source-bucket/sample_test_file.json"
output_path = "s3://sdp7-destination-bucket/"

# Read JSON from S3
dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [input_path]},
    format="json"
)

# Convert DynamicFrame to DataFrame
dataframe = dynamic_frame.toDF().cache()

# Save as CSV
dataframe.write.format("csv").option("header", "true").save(output_path)

# Complete the job
job.commit()
