import * as fs from 'fs';

import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

const TABLE_NAME = "items"
const PRIMARY_KEY = "itemId"

const getLambdaPaths = function(lambda_name: String) {
  const codePath = path.resolve(
    __dirname,
    `../src/lambda/${lambda_name}`
  )
  const envPath = path.resolve(
    __dirname,
    `../python_modules/lambda/${lambda_name}`
  )
  return { codePath, envPath }
}

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

    let {codePath, envPath } = getLambdaPaths('get_item')
    const getItemLambda = new lambda.Function(this, 'getItemFunction', {
      code: new lambda.AssetCode(codePath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(envPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );
    fs.writeFileSync(path.resolve(envPath, 'env.sh'),
      `export TABLE_NAME=items\nexport PRIMARY_KEY=itemId`
    );

    codePath = getLambdaPaths('get_items').codePath
    envPath = getLambdaPaths('get_items').envPath
    const getItemsLambda = new lambda.Function(this, 'getItemsFunction', {
      code: new lambda.AssetCode(codePath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
      }
    });
    fs.writeFileSync(path.resolve(envPath, '.env'),
      `TABLE_NAME=items`
    );
    fs.writeFileSync(path.resolve(envPath, 'env.sh'),
      `export TABLE_NAME=items`
    );
    
    codePath = getLambdaPaths('create_item').codePath
    envPath = getLambdaPaths('create_item').envPath
    const createItemLambda = new lambda.Function(this, 'createItemFunction', {
      code: new lambda.AssetCode(codePath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(envPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );
    fs.writeFileSync(path.resolve(envPath, 'env.sh'),
      `export TABLE_NAME=items\nexport PRIMARY_KEY=itemId`
    );
    
    codePath = getLambdaPaths('update_item').codePath
    envPath = getLambdaPaths('update_item').envPath
    const updateItemLambda = new lambda.Function(this, 'updateItemFunction', {
      code: new lambda.AssetCode(codePath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(envPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );
    fs.writeFileSync(path.resolve(envPath, 'env.sh'),
      `export TABLE_NAME=items\nexport PRIMARY_KEY=itemId`
    );
    
    codePath = getLambdaPaths('delete_item').codePath
    envPath = getLambdaPaths('delete_item').envPath
    const deleteItemLambda = new lambda.Function(this, 'deleteItemFunction', {
      code: new lambda.AssetCode(codePath),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: PRIMARY_KEY
      }
    });
    fs.writeFileSync(path.resolve(envPath, '.env'),
      `TABLE_NAME=items\nPRIMARY_KEY=itemId`
    );
    fs.writeFileSync(path.resolve(envPath, 'env.sh'),
      `export TABLE_NAME=items\nexport PRIMARY_KEY=itemId`
    );
    
    dynamoTable.grantReadWriteData(getItemLambda);
    dynamoTable.grantReadWriteData(getItemsLambda);
    dynamoTable.grantReadWriteData(createItemLambda);
    dynamoTable.grantReadWriteData(updateItemLambda);
    dynamoTable.grantReadWriteData(deleteItemLambda);
    
    const api = new apigateway.RestApi(this, 'itemsApi', {
      restApiName: "Items Service"
    })
    
    const itemsResource = api.root.addResource('items');
    const getItemsIntegration = new apigateway.LambdaIntegration(getItemsLambda);
    itemsResource.addMethod('GET', getItemsIntegration);
    const createItemIntegration = new apigateway.LambdaIntegration(createItemLambda);
    itemsResource.addMethod('POST', createItemIntegration);
    
    const itemResource = itemsResource.addResource("{id}")
    const getItemIntegration = new apigateway.LambdaIntegration(getItemLambda);
    itemResource.addMethod("GET", getItemIntegration);
    const updateItemIntegration = new apigateway.LambdaIntegration(updateItemLambda);
    itemResource.addMethod("PATCH", updateItemIntegration);
    const deleteItemIntegration = new apigateway.LambdaIntegration(deleteItemLambda);
    itemResource.addMethod("DELETE", deleteItemIntegration);
    
    addCorsOptions(itemResource);
    addCorsOptions(itemsResource);
  }
}

function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },  
    }]
  })
}