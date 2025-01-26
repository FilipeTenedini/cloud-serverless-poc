import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ProductRepository } from '/opt/nodejs/products-layer';
import { errorHandler } from 'error/error-handler';
import { NotFoundException } from 'error/exceptions/not-found.excepetion';
import { Product, ProductEventType } from 'types/product';
import { ProductEvent } from 'types/product';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';
const { DynamoDB, Lambda } = AWS;

AWSXRay.captureAWS(AWS);
const productsDb = process.env.PRODUCTS_DB as string;
const ddbClient = new DynamoDB.DocumentClient();
const productEventsFunctionName = process.env.PRODUCTS_EVENTS_FUNCTION_NAME as string;
const lambdaClient = new Lambda();
const productRepository = new ProductRepository(ddbClient, productsDb);

export const handler =  errorHandler(async (event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> => {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;
	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/products' && httpMethod === 'POST') {
		console.log('POST /products');

		const product = JSON.parse(event.body!) as Product;

		const productCreated = await productRepository.create(product);

		const eventResponse = await sendProductEvent(productCreated, 'email@email.com.br', lambdaRequestId, ProductEventType.CREATED);
		console.log(`Event response: ${eventResponse}`);

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

				const eventResponse = await sendProductEvent(productUpdated, 'email2@email2.com.br', lambdaRequestId, ProductEventType.UPDATED);
				console.log(`Event response: ${eventResponse}`);

				return {
					statusCode: 200,
					body: JSON.stringify(productUpdated)
				};
			} catch (conditionalCheckFailedException) {
				throw new NotFoundException(`Error updating product ${productId}`, apiRequestId);
			}

		} else if (httpMethod === 'DELETE') {
			console.log(`DELETE /products/{id} called with ${productId}`);


			//TODO verificar por que está voltando not found
			const productDeleted = await productRepository.delete(productId);

			if (!productDeleted) {
				throw new NotFoundException(`Product ${productId} not found to delete.`, apiRequestId);
			}

			const eventResponse = await sendProductEvent(productDeleted, 'email3@email3.com.br', lambdaRequestId, ProductEventType.DELETED);
			console.log(`Event response: ${eventResponse}`);

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

function sendProductEvent(product: Product, email: string, lambdaRequestId: string, eventType: ProductEventType) {
	// TODO: standardization of logs here on function
	const event: ProductEvent = {
		product,
		email,
		eventType,
		requestId: lambdaRequestId,
	};

	return lambdaClient.invoke({
		FunctionName: productEventsFunctionName,
		Payload: JSON.stringify(event),
		InvocationType: 'RequestResponse'
	}).promise();
}