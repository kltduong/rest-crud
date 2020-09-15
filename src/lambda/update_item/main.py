import json
import os
import uuid

import boto3
from boto3.dynamodb.conditions import Key


TABLE_NAME = os.environ["TABLE_NAME"]
PRIMARY_KEY = os.environ["PRIMARY_KEY"]


DYNAMO_DB = boto3.resource("dynamodb", region_name="ap-southeast-1")
table = DYNAMO_DB.Table(TABLE_NAME)


def handler(event, context):
    print("event: ", event)
    requested_item_id = event["pathParameters"]["id"]
    try:
        editted_item = json.loads(event["body"])
        if not editted_item:
            res = {
                "statusCode": 400,
                "body": 'invalid request, no arguments provided'
            }
            # print(res)
            return res

        update_expression = "SET " + ", ".join(f'#{k} = :{k}' for k in editted_item)
        expression_attribute_names = {f'#{k}': k for k in editted_item}
        expression_attribute_values = {f':{k}': v for k, v in editted_item.items()}
        
        # print(update_expression)
        # print(expression_attribute_names)
        # print(expression_attribute_values)
        
        table.update_item(
            Key={PRIMARY_KEY: requested_item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values
        )
        res = {
            "statusCode": 200,
            "body": "success"
        }
        # print(res)
        return res
    except KeyError as e:
        res = {
            "statusCode": 400,
            "body": f"Error: invalid event format. {str(e)}"
        }
        # print(res)
        return res
    except Exception as e:
        # import traceback
        # traceback.print_exc()
        res = {
            "statusCode": 500,
            "body": f"ERROR: {str(e)}"
        }
        # print(res)
        return res
        

if __name__ == "__main__":
    event = {
        "pathParameters": {"id": "39e5d099-f731-11ea-9156-ab03ca03d066"},
        "body": json.dumps({"company": "EA4", "year": "2014"})
    }
    handler(event, {})
