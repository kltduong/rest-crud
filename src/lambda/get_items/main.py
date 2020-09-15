import json
import os

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ["TABLE_NAME"]

DYNAMO_DB = boto3.resource("dynamodb", region_name="ap-southeast-1")
table = DYNAMO_DB.Table(TABLE_NAME)


def handler(event, context):
    print("event: ", event)
    try:
        response = table.scan(
            ProjectionExpression="#company, #address",
            ExpressionAttributeNames={"#company": "company", "#address": "address"},
        )
        return {
            "statusCode": 200,
            "body": json.dumps(response["Items"])
        }
    except KeyError:
        return {
            "statusCode": 400,
            "body": "Error: You are missing the path parameter id"
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"ERROR: {str(e)}"
        }
        

if __name__ == "__main__":
    handler({}, None)
