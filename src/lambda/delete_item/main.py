import json
import os

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ["TABLE_NAME"]
PRIMARY_KEY = os.environ["PRIMARY_KEY"]


DYNAMO_DB = boto3.resource("dynamodb", region_name="ap-southeast-1")
table = DYNAMO_DB.Table(TABLE_NAME)


def handler(event, context):
    print("event: ", event)
    try:
        requested_item_id = event["pathParameters"]["id"]
        table.delete_item(
            Key={PRIMARY_KEY: requested_item_id},
        )
        res = {
            "statusCode": 200,
            "body": "success"
        }
        print(res)
        return res
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
        {'pathParameters': {'id': 'dc0a9d7e-f732-11ea-9cce-5d273170886c'}},
        None
    )
