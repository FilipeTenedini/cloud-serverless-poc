import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ProductsAppStack extends cdk.Stack {
	readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here
		this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsFetchFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			functionName:'ProductsFetchFunction',
			entry: 'lambda/products/products-fetch-function.ts',
			handler: 'handler',
			memorySize: 512,
			timeout: cdk.Duration.seconds(5),
			bundling: {
				minify: true,
				sourceMap: false,
			}
		});

	}
}