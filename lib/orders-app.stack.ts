import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscription from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface OrdersAppStackProps extends cdk.StackProps {
    productsDb: dynamodb.Table,
    eventsDb: dynamodb.Table
}

export class OrdersAppStack extends cdk.Stack {
	ordersHandler: lambdaNodeJs.NodejsFunction;

	constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
		super(scope, id, props);

		const ordersDb = new dynamodb.Table(this, 'OrdersDb', {
			tableName: 'orders',
			/* esse recurso o padrão é que não seja destruído ao rodar um destroy para não perder os dados.
            nesse momento deixaremos como destroy para facilitar a limpeza do ambiente.*/
			removalPolicy: cdk.RemovalPolicy.DESTROY,
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


		// Orders Api Layer
		const ordersLayerArn = ssm.StringParameter.valueForStringParameter(this, 'OrdersLayerVersionArn');
		const ordersLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'OrdersLayerVersionArn', ordersLayerArn);

		// Products Layer
		const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn');
		const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn);

		// Orders Topic
		const ordersTopic = new sns.Topic(this, 'OrderEventsTopic', {
			displayName: 'Order Events Topic',
			topicName: 'order-events-topic',
		});


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
				ORDER_EVENTS_TOPIC_ARN: ordersTopic.topicArn
			},
			layers: [ordersLayer, productsLayer],
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});
		ordersDb.grantReadWriteData(this.ordersHandler);
		props.productsDb.grantReadData(this.ordersHandler);
		ordersTopic.grantPublish(this.ordersHandler);

		const ordersEventsHandler = new lambdaNodeJs.NodejsFunction(this, 'OrdersEventsFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			functionName:'OrdersEventsFunction',
			entry: 'lambda/orders/orders-events.function.ts',
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
				EVENTS_DB: props.eventsDb.tableName
			},
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});

		ordersTopic.addSubscription(new snsSubscription.LambdaSubscription(ordersEventsHandler));
		ordersEventsHandler.addToRolePolicy(new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ['dynamodb:PutItem'],
			resources: [props.eventsDb.tableArn],
			conditions: {
				['ForAllValues:StringLike']: {
					'dynamodb:LeadingKeys': ['#product_*']
				}
			},
		}));
	}

}

