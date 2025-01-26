import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface OrdersAppStackProps extends cdk.StackProps {
    productsDb: dynamodb.Table
}

export class OrdersAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
		super(scope, id, props);
	}
}
