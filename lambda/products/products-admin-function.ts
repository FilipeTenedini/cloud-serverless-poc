import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ProductRepository } from '/opt/nodejs/products-layer';
import  { DynamoDB } from 'aws-sdk';
import { errorHandler } from 'error/error-handler';
import {  } from 'aws-cdk-lib/aws-lambda';
import { NotFoundException } from 'error/exceptions/not-found.excepetion';
import { Product } from 'types/product';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';

AWSXRay.captureAWS(AWS);
const productsDb = process.env.PRODUCTS_DB as string;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDb);

export const handler =  errorHandler(async (event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> => {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;
	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/products' && httpMethod === 'POST') {
		console.log('POST /products');

		const product = JSON.parse(event.body!) as Product;

		const productCreated = await productRepository.create(product);

		return {
			statusCode: 200,
			body: JSON.stringify(productCreated)
		};
	} else if (event.resource === '/products/{id}') {
		const productId = event.pathParameters?.id as string;

		if (httpMethod === 'PUT') {
			console.log(`PUT /products/{id} called with ${productId}`);

			const product = JSON.parse(event.body!) as Product;

			try {
				const productUpdated = await productRepository.update(productId, product);

				return {
					statusCode: 200,
					body: JSON.stringify(productUpdated)
				};
			} catch (conditionalCheckFailedException) {
				throw new NotFoundException(`Error updating product ${productId}`, apiRequestId);
			}

		} else if (httpMethod === 'DELETE') {
			console.log(`DELETE /products/{id} called with ${productId}`);


			const productDeleted = await productRepository.delete(productId);

			if (!productDeleted) {
				throw new NotFoundException(`Product ${productId} not found to delete.`, apiRequestId);
			}

			return {
				statusCode: 200,
				body: JSON.stringify(productDeleted)
			};
		}
	}

	return {
		statusCode: 400,
		body: JSON.stringify({
			message: 'Bad Request'
		})
	};

});