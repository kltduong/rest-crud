import * as fs from 'fs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

const TABLE_NAME = "items"
const PRIMARY_KEY = "itemId"

export class RestCrudStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
        const dynamoTable = new dynamodb.Table(this, 'items', {
          partitionKey: {
            name: PRIMARY_KEY,
            type: dynamodb.AttributeType.STRING
          },
          tableName: TABLE_NAME,
          removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });

    const getOneItemPath = path.resolve(
      __dirname,
      '../src/lambda/get-one'
    )
    const getOneLambda = new lambda.Function(this, 'getOneItemFunction', {
      code: new lambda.AssetCode(getOneItemPath),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(getOneItemPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );


    const getOneItemPythonPath = path.resolve(
      __dirname,
        '../src/lambda/get_one_python'
    )
    const getOnePythonLambda = new lambda.Function(this, 'getOneItemPythonFunction', {
      code: new lambda.AssetCode(getOneItemPythonPath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(getOneItemPythonPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );

  }
}
