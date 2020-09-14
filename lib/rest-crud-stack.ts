import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';


export class RestCrudStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
        const dynamoTable = new dynamodb.Table(this, 'items', {
          partitionKey: {
            name: 'itemId',
            type: dynamodb.AttributeType.STRING
          },
          tableName: 'items',
          removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });

    const getOneLambda = new lambda.Function(this, 'getOneItemFunction', {
      code: new lambda.AssetCode(
        path.resolve(
          __dirname,
          '../src/lambda/get-one'
        )
      ),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    const getOnePythonLambda = new lambda.Function(this, 'getOneItemPythonFunction', {
      code: new lambda.AssetCode(
        path.resolve(
          __dirname,
          '../src/lambda/get_one_python'
        )
      ),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

  }
}
