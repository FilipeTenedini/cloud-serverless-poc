import { Callback, Context } from 'aws-lambda';
import { ProductEvent } from 'types';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';
const { DynamoDB } = AWS;

AWSXRay.captureAWS(AWS);
const eventsDb = process.env.EVENTS_DB as string;
const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: ProductEvent, ctx: Context, callback: Callback): Promise<void> {
	console.log(event);
	console.log(`Lambda Request ID: ${ctx.awsRequestId}`);

	await createEvent(event);

	callback(null, {
		statusCode: 200,
		body: JSON.stringify({ message: 'Ok - Product Event created' }),
	});
}

function createEvent(event: ProductEvent) {
	const timestamp = Date.now();
	const ttl = ~~(timestamp / 1000 + 60 * 5);

	return dbClient.put({
		TableName: eventsDb,
		Item: {
			pk: `#product_${event.product.code}`,
			sk: `${event.eventType}#${timestamp}`,
			ttl,
			createdAt: timestamp,
			eventType: event.eventType,
			requestId: event.requestId,
			product: event.product,
			email: event.email,
		},
	}).promise();
}