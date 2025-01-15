import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface EcommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJs.NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: EcommerceApiStackProps) {
		super(scope, id, props);

		const api = new apiGateway.RestApi(this, 'EcommerceApi', {
			restApiName: 'EcommerceApi',
		});

		const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler);
		const productsResource = api.root.addResource('products');
		productsResource.addMethod('GET', productsFetchIntegration);
	}
}

/**
 - este api gateway está sozinho em uma stack porque vai expor várias APIS de vários serviços diferentes
 - também seria possível criar um api gateway para cada API exposta porém haveria a desvantagem
    de ter que gerenciar vários recursos e não somente um
 */