import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import { type Construct } from 'constructs';

export class ProductAppStack extends cdk.Stack {
  readonly productFetchHandler: lambdaNodeJS.NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.productFetchHandler = new lambdaNodeJS.NodejsFunction(this, 'ProductFetchFunction', {
      functionName: 'ProductFetchFunction',
      entry: 'lambda/products/product-fetch.ts',
      handler: 'handler',
      memorySize: 512,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
        sourceMap: false
      }
    });
  }
}
