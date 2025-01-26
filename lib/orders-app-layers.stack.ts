import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class OrdersAppLayerStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const ordersLayer = new lambda.LayerVersion(this, 'OrdersLayer', {
			code: lambda.Code.fromAsset('lambda/orders/layers/orders-layer'),
			compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_LATEST],
			layerVersionName: 'OrdersLayer',
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});

		new ssm.StringParameter(this, 'OrdersLayerVersionArn', {
			parameterName: 'OrdersLayerVersionArn',
			stringValue: ordersLayer.layerVersionArn
		});
	}
}