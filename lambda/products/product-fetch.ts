import { type APIGatewayProxyEvent, type Context, type APIGatewayProxyResult } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const { resource, httpMethod: method, requestContext: { requestId: apiRequestId } } = event;
  const { awsRequestId: lambdaRequestId } = context;

  console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

  if (resource === '/products') {
    if (method === 'GET') {
      console.log('GET PRODUCTS');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'GET /products' })
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad Request' })
  };
}
