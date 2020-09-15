import json
import os
import uuid

import boto3

TABLE_NAME = os.environ["TABLE_NAME"]
PRIMARY_KEY = os.environ["PRIMARY_KEY"]


DYNAMO_DB = boto3.resource("dynamodb", region_name="ap-southeast-1")
table = DYNAMO_DB.Table(TABLE_NAME)


def handler(event, context):
    print("event: ", event)
    try:
        item = event["body"]
        item["itemId"] = str(uuid.uuid1())
        table.put_item(Item=item)
        res = {
            "statusCode": 200,
            "body": "success"
        }
        print(res)
        return res
    except KeyError as e:
        res = {
            "statusCode": 400,
            "body": f"Error: invalid event format. {str(e)}"
        }
        print(res)
        return res
    except Exception as e:
        res = {
            "statusCode": 500,
            "body": f"ERROR: {str(e)}"
        }
        print(res)
        return res
        

if __name__ == "__main__":
    event = {
        "body": {"company": "EA", "address": "Bac Hai", "year": 2015}
    }
    handler(event, {})
