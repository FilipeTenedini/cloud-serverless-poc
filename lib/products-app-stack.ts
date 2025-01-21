import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ProductsAppStack extends cdk.Stack {
	readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
	readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
	readonly productsDb: dynamodb.Table;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here

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
			},
			environment: {
				PRODUCTS_DB: this.productsDb.tableName,
			},
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
			},
			environment: {
				PRODUCTS_DB: this.productsDb.tableName,
			},
		});

		this.productsDb.grantReadData(this.productsFetchHandler);
		this.productsDb.grantWriteData(this.productsAdminHandler);

	}
}