import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;

	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/products' && httpMethod === 'POST') {
		console.log('POST /products');

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'POST /products succefully returned (hello cdk)'
			})
		};
	} else if (event.resource === '/products/{id}') {
		const productId = event.pathParameters?.id as string;

		if (httpMethod === 'PUT') {
			console.log(`PUT /products/{id} called with ${productId}`);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: `PUT /products/{id} called with ${productId}`
				})
			};
		} else if (httpMethod === 'DELETE') {
			console.log(`DELETE /products/{id} called with ${productId}`);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: `DELETE /products/{id} called with ${productId}`
				})
			};
		}
	}

	return {
		statusCode: 400,
		body: JSON.stringify({
			message: 'Bad Request'
		})
	};

}