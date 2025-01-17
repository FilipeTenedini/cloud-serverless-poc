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
	}

	return {
		statusCode: 400,
		body: JSON.stringify({
			message: 'Bad Request'
		})
	};

}