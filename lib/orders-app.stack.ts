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
	ordersHandler: lambdaNodeJs.NodejsFunction;

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

		this.ordersHandler = new lambdaNodeJs.NodejsFunction(this, 'OrdersFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			functionName:'OrdersFunction',
			entry: 'lambda/orders/orders.function.ts',
			handler: 'handler',
			memorySize: 512,
			timeout: cdk.Duration.seconds(5),
			bundling: {
				minify: true,
				sourceMap: false,
				nodeModules: [
					'aws-xray-sdk-core'
				]
			},
			environment: {
				PRODUCTS_DB: props.productsDb.tableName,
				ORDERS_DB: ordersDb.tableName,
			},
			layers: [ordersLayer, productsLayer],
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});

		ordersDb.grantReadWriteData(this.ordersHandler);
		props.productsDb.grantReadData(this.ordersHandler);
	}
}

