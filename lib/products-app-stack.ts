import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface ProductsAppStackProps extends cdk.StackProps {
    eventsDb: dynamodb.Table;
}
export class ProductsAppStack extends cdk.Stack {
	readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
	readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
	readonly productsDb: dynamodb.Table;
	readonly eventsDb: dynamodb.Table;

	constructor(scope: Construct, id: string, props: ProductsAppStackProps) {
		super(scope, id, props);

		this.productsDb = new dynamodb.Table(this, 'ProductsTable', {
			tableName: 'products',
			/* esse recurso o padrão é que não seja destruído ao rodar um destroy para não perder os dados.
            nesse momento deixaremos como destroy para facilitar a limpeza do ambiente.*/
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			partitionKey: {
				name: 'id',
				type: dynamodb.AttributeType.STRING,
			},
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO
			writeCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO
		});

		const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn');
		const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn);

		const eventsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsEventsLayerVersionArn');
		const eventsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsEventsLayerVersionArn', eventsLayerArn);

		const eventsHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsEventsFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			functionName:'ProductsEventsFunction',
			entry: 'lambda/products/products-events-function.ts',
			handler: 'handler',
			memorySize: 512,
			timeout: cdk.Duration.seconds(2),
			bundling: {
				minify: true,
				sourceMap: false,
				nodeModules: [
					'aws-xray-sdk-core'
				]
			},
			environment: {
				EVENTS_DB: props.eventsDb.tableArn,
			},
			layers: [eventsLayer],
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});
		props.eventsDb.grantReadWriteData(eventsHandler);

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
				nodeModules: [
					'aws-xray-sdk-core'
				]
			},
			environment: {
				PRODUCTS_DB: this.productsDb.tableName,
			},
			layers: [productsLayer],
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});

		this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsAdminFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			functionName:'ProductsAdminFunction',
			entry: 'lambda/products/products-admin-function.ts',
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
				PRODUCTS_DB: this.productsDb.tableName,
				PRODUCTS_EVENTS_FUNCTION_NAME: eventsHandler.functionName,
			},
			layers: [productsLayer, eventsLayer],
			tracing: lambda.Tracing.ACTIVE,
			insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
		});

		this.productsDb.grantReadData(this.productsFetchHandler);
		this.productsDb.grantWriteData(this.productsAdminHandler);
		eventsHandler.grantInvoke(this.productsAdminHandler);
	}
}