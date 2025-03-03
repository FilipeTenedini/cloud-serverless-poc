import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { errorHandler } from 'error/error-handler';
import { ProductRepository } from '/opt/nodejs/products-layer';
import { OrderRepository } from '/opt/nodejs/orders-layer';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';
import { Order, OrderProduct, OrderRequest, OrderResponse, Product } from 'types';
import { NotFoundException } from 'error/exceptions/not-found.excepetion';
const { DynamoDB } = AWS;

AWSXRay.captureAWS(AWS);
const ordersDb = process.env.ORDERS_DB as string;
const productsDb = process.env.PRODUCTS_DB as string;
const dbClient = new DynamoDB.DocumentClient();
const orderRepository = new OrderRepository(dbClient, ordersDb);
const productRepository = new ProductRepository(dbClient, productsDb);

export const handler = errorHandler(async (event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> => {
	const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
	const { awsRequestId: lambdaRequestId } = ctx;

	console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

	if (event.resource === '/orders') {
		if (httpMethod === 'GET') {
			console.log('GET /orders');

			if (event.queryStringParameters) {
				const email = event.queryStringParameters!.email;
				const orderId = event.queryStringParameters!.orderId;

				if (email && orderId) {
					// get one from an user
					const order = await orderRepository.getByPkAndSk(email, orderId);

					if (!order) {
						throw new NotFoundException(`Order with id ${orderId} not found`, apiRequestId);
					}

					return {
						statusCode: 200,
						body: JSON.stringify(buildOrderResponse(order))
					};
				} else if (email && !orderId) {
					// get all from an user
					const orders = await orderRepository.getByPk(email);
					return {
						statusCode: 200,
						body: JSON.stringify(orders.map(buildOrderResponse))
					};
				}
			} else {
				//getAll
				const orders = await orderRepository.getAll();
				return {
					statusCode: 200,
					body: JSON.stringify(orders.map(buildOrderResponse))
				};
			}
		} else if (httpMethod === 'POST') {
			console.log('POST /orders');
			const ordersRequest = JSON.parse(event.body as string) as OrderRequest;
			const products = await productRepository.getProductsByIds(ordersRequest.productIds);
			const order = buildOrder(ordersRequest, products);
			const createdOrder = await orderRepository.create(order);

			return {
				statusCode: 201,
				body: JSON.stringify(buildOrderResponse(createdOrder))
			};
		} else if (httpMethod === 'DELETE') {
			console.log('DELETE /orders');
			// atributos foram validados no api gateway
			const email = event.queryStringParameters!.email as string;
			const orderId = event.queryStringParameters!.orderId as string;

			const orderDeleted = await orderRepository.delete(email, orderId);

			//TODO verificar por que está voltando not found
			if (!orderDeleted) {
				throw new NotFoundException(`Order with id ${orderId} not found`, apiRequestId);
			}

			return {
				statusCode: 200,
				body: JSON.stringify(buildOrderResponse(orderDeleted))
			};
		}
	}

	return {
		statusCode: 400,
		body: 'Bad Request'
	};
});


function buildOrderResponse(order: Order): OrderResponse {
	return {
		email: order.pk,
		id: order.sk as string,
		createdAt: order.createdAt as number,
		products: order.products.map((product) => {
			return {
				code: product.code,
				price: product.price,
			};
		}),
		billing: {
			paymentMethod: order.billing.paymentMethod,
			totalPrice: order.billing.totalPrice,
		},
		shipping: {
			carrier: order.shipping.carrier,
			type: order.shipping.type,
		},

	};
}

function buildOrder(order: OrderRequest, products: Product[]): Order {
	let totalPrice = 0;
	const orderProducts: OrderProduct[] = products.map((p) => {
		totalPrice += p.price;
		return {
			price: p.price,
			code: p.code,
		};
	});

	return {
		pk: order.email,
		billing: {
			totalPrice,
			paymentMethod: order.payment
		},
		shipping: {
			carrier: order.shipping.carrier,
			type: order.shipping.type,
		},

		products: orderProducts,
	};
}