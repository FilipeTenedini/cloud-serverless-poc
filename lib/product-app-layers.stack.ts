import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class ProductAppLayersStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const productsLayer = new lambda.LayerVersion(this, 'ProductsLayer', {
			code: lambda.Code.fromAsset('lambda/products/layers/products-layer'),
			compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_LATEST],
			layerVersionName: 'ProductsLayer',
			// por padrão ao destruir essa stack o lambda layer também será destruído
			// aqui nós iremos manter o lambda layer mesmo após a destruição da stack
			// porque pode ser que a gente esteja usando esse layer em outra stack
			removalPolicy: cdk.RemovalPolicy.RETAIN
		});

		new ssm.StringParameter(this, 'ProductsLayerVersionArn', {
			parameterName: 'ProductsLayerVersionArn',
			stringValue: productsLayer.layerVersionArn
		});

		const productsEventsLayer = new lambda.LayerVersion(this, 'ProductsEventsLayer', {
			code: lambda.Code.fromAsset('lambda/products/layers/products-events-layer'),
			compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_LATEST],
			layerVersionName: 'ProductsEventsLayer',
			// por padrão ao destruir essa stack o lambda layer também será destruído
			// aqui nós iremos manter o lambda layer mesmo após a destruição da stack
			// porque pode ser que a gente esteja usando esse layer em outra stack
			removalPolicy: cdk.RemovalPolicy.RETAIN,

		});

		new ssm.StringParameter(this, 'ProductsEventsLayerVersionArn', {
			parameterName: 'ProductsEventsLayerVersionArn',
			stringValue: productsEventsLayer.layerVersionArn
		});
	}
}