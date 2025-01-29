import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { BaseException } from './exceptions/base-exception';

type LambdaHandler =  (event: APIGatewayProxyEvent, ctx: Context) => Promise<APIGatewayProxyResult>;

// TODO: fazer ser generico para englobar functions que não são invocados pelo api gateway, que são invocadas por outras functions,
// como por exemplo
// products-events.function
export const errorHandler = (handler: LambdaHandler) => {
	return async (event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> => {
		try {
			return await handler(event, ctx);
		} catch (error) {
			console.error('Error:', error);

			if (error instanceof BaseException) {
				return {
					statusCode: error.statusCode,
					body: JSON.stringify({
						message: error.message,
						requestId: error.requestId
					})
				};
			}

			return {
				statusCode: 500,
				body: JSON.stringify({
					message: 'Erro interno do servidor',
					requestId: error instanceof Error ? error.message : 'unknown'
				})
			};
		}
	};
};