import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;

	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/products' && httpMethod === 'GET') {
		console.log('GET /products');

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'GET /products succefully returned (hello cdk)'
			})
		};
	} else if (event.resource === '/products/{id}') {
		const productId = event.pathParameters?.id as string;
		console.log(`GET /products/{id} called with ${productId}`);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `GET /products/{id} called with ${productId}`
			})
		};
	}

	return {
		statusCode: 400,
		body: JSON.stringify({
			message: 'Bad Request'
		})
	};

}