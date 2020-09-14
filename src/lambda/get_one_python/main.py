import json
import os

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

TABLE_NAME = os.environ["TABLE_NAME"]
PRIMARY_KEY = os.environ["PRIMARY_KEY"]


DYNAMO_DB = boto3.resource("dynamodb", region_name="ap-southeast-1")
table = DYNAMO_DB.Table(TABLE_NAME)


def handler(event, context):
    print("event: ", event)
    try:
        requested_item_id = event["pathParameters"]["id"]
        response = table.query(
            ProjectionExpression="#a",
            ExpressionAttributeNames={"#a": "a"},
            KeyConditionExpression=Key(PRIMARY_KEY).eq(requested_item_id)
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
    handler(
        {'pathParameters': {'id': 1}},
        None
    )