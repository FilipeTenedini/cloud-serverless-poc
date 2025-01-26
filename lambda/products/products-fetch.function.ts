import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ProductRepository } from '/opt/nodejs/products-layer';
import  { DynamoDB } from 'aws-sdk';
import { errorHandler } from 'error/error-handler';
import { NotFoundException } from 'error/exceptions/not-found.excepetion';
import { BadRequestException } from 'error/exceptions/bad-request.exception';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';

AWSXRay.captureAWS(AWS);
const productsDb = process.env.PRODUCTS_DB as string;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDb);

export const handler = errorHandler(async (event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> => {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;

	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/products' && httpMethod === 'GET') {
		console.log('GET /products');
		const products = await productRepository.getAll();

		return {
			statusCode: 200,
			body: JSON.stringify(products)
		};
	} else if (event.resource === '/products/{id}') {
		const productId = event.pathParameters?.id as string;
		console.log(`GET /products/{id} called with ${productId}`);

		const product = await productRepository.findById(productId);

		// TODO: caso o repository retorne um erro, o handler deve tratar o erro e retornar uma resposta adequada e nao 404

		if (!product) {
			throw new NotFoundException(`Product ${productId} not found`, apiRequestId);
		}

		return {
			statusCode: 200,
			body: JSON.stringify(product)
		};
	}

	throw new BadRequestException(`Endpoint ${event.resource} not found`, apiRequestId);

});
