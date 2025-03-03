import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface EcommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJs.NodejsFunction;
    productsAdminHandler: lambdaNodeJs.NodejsFunction;
    ordersHandler: lambdaNodeJs.NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: EcommerceApiStackProps) {
		super(scope, id, props);

		const logGroup = new cwlogs.LogGroup(this, 'EcommerceApiLogs', {});
		const api = new apiGateway.RestApi(this, 'EcommerceApi', {
			restApiName: 'EcommerceApi',
			cloudWatchRole: true,
			deployOptions: {
				accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
				// precisa tomar cuidado com ip e user porque pode identificar o usuário, precisa ter cuidado com o que se loga
				accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
					httpMethod: true,
					ip: true,
					protocol: true,
					requestTime: true,
					resourcePath: true,
					responseLength: true,
					status: true,
					caller: true,
					user: true,
				})
			}
		});

		this.createProductsResources(props, api);

		this.createOrdersResources(props, api);

	}

	private createProductsResources(props: EcommerceApiStackProps, api: apiGateway.RestApi) {
		const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler);
		const productsAdminIntegration = new apiGateway.LambdaIntegration(props.productsAdminHandler);

		const productsValidator = new apiGateway.RequestValidator(this, 'ProductsValidator', {
			restApi: api,
			requestValidatorName: 'ProductsValidator',
			validateRequestParameters: true,
		});

		const productsBodyValidator = new apiGateway.RequestValidator(this, 'ProductsBodyValidator', {
			restApi: api,
			requestValidatorName: 'ProductsBodyValidator',
			validateRequestBody: true,
		});
		const productModel = new apiGateway.Model(this, 'ProductModel', {
			restApi: api,
			modelName: 'ProductModel',
			schema: {
				type: apiGateway.JsonSchemaType.OBJECT,
				properties: {
					productName: {
						type: apiGateway.JsonSchemaType.STRING,
					},
					price: {
						type: apiGateway.JsonSchemaType.NUMBER,
					},
					code: {
						type: apiGateway.JsonSchemaType.STRING,
					},
					model: {
						type: apiGateway.JsonSchemaType.STRING,
					},
					productUrl: {
						type: apiGateway.JsonSchemaType.STRING,
					}
				},
				required: [
					'productName',
					'code',
				]
			}
		});

		const productsResource = api.root.addResource('products');
		productsResource.addMethod('GET', productsFetchIntegration);
		productsResource.addMethod('POST', productsAdminIntegration, {
			requestValidator: productsBodyValidator,
			requestModels: {
				'application/json': productModel
			}
		});

		const productsIdResource = productsResource.addResource('{id}');
		productsIdResource.addMethod('GET', productsFetchIntegration);
		productsIdResource.addMethod('PUT', productsAdminIntegration, {
			requestValidator: productsValidator,
			requestParameters: {
				'method.request.path.id': true,
			}
		});
		productsIdResource.addMethod('DELETE', productsAdminIntegration, {
			requestValidator: productsValidator,
			requestParameters: {
				'method.request.path.id': true,
			}
		});
	}

	private createOrdersResources(props: EcommerceApiStackProps, api: apiGateway.RestApi) {
		const ordersIntegration = new apiGateway.LambdaIntegration(props.ordersHandler);
		const ordersValidator = new apiGateway.RequestValidator(this, 'OrdersDeletionValidator', {
			restApi: api,
			requestValidatorName: 'OrdersDeletionValidator',
			validateRequestParameters: true,
		});
		const orderBodyValidator = new apiGateway.RequestValidator(this, 'OrderBodyValidator', {
			restApi: api,
			requestValidatorName: 'OrderBodyValidator',
			validateRequestBody: true,
		});
		const orderModel = new apiGateway.Model(this, 'OrderModel', {
			restApi: api,
			modelName: 'OrderModel',
			schema: {
				type: apiGateway.JsonSchemaType.OBJECT,
				properties: {
					email: {
						type: apiGateway.JsonSchemaType.STRING,
					},
					productIds: {
						type: apiGateway.JsonSchemaType.ARRAY,
						minItems: 1,
						items: {
							type: apiGateway.JsonSchemaType.STRING,
						},
					},
					payment: {
						type: apiGateway.JsonSchemaType.STRING,
						enum: ['CASH', 'DEBIT_CARD', 'CREDIT_CARD'],
					}
				},
				required: [
					'email',
					'productIds',
					'payment'
				]
			},
		});

		const ordersResource = api.root.addResource('orders');
		ordersResource.addMethod('GET', ordersIntegration);
		ordersResource.addMethod('DELETE', ordersIntegration, {
			requestParameters: {
				'method.request.querystring.orderId': true,
				'method.request.querystring.email': true
			},
			requestValidator: ordersValidator,
		});
		ordersResource.addMethod('POST', ordersIntegration, {
			requestValidator: orderBodyValidator,
			requestModels: {
				'application/json' : orderModel
			}
		});
	}
}

/**
 - este api gateway está sozinho em uma stack porque vai expor várias APIS de vários serviços diferentes
 - também seria possível criar um api gateway para cada API exposta porém haveria a desvantagem
    de ter que gerenciar vários recursos e não somente um
 */