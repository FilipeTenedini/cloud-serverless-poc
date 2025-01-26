import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

		const ordersDb = new dynamodb.Table(this, 'OrdersDb', {
			tableName: 'orders',
			partitionKey: {
				name: 'pk',
				type: dynamodb.AttributeType.STRING
			},
			sortKey: {
				name: 'sk',
				type: dynamodb.AttributeType.STRING
			},
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO
			writeCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO
		});


		const ordersLayerArn = ssm.StringParameter.valueForStringParameter(this, 'OrdersLayerVersionArn');
		const ordersLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'OrdersLayerVersionArn', ordersLayerArn);

		const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn');
		const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn);


	}
}

