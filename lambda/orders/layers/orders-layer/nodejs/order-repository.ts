import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Order } from 'types';
import  { v4 as uuid } from 'uuid';

export class OrderRepository {
	private dbClient: DocumentClient;
	private ordersDb: string;

	constructor(dbClient: DocumentClient, ordersDb: string) {
		this.dbClient = dbClient;
		this.ordersDb = ordersDb;
	}

	async create(order: Order): Promise<Order> {
		order.sk = uuid();
		order.createdAt = Date.now();

		await this.dbClient.put({
			TableName: this.ordersDb,
			Item: order,
		}).promise();

		return order;
	}

	async getAll(): Promise<Order[]> {
		const data = await this.dbClient.scan({
			TableName: this.ordersDb,
		}).promise();

		return data.Items as Order[];
	}

	async getByPk(pkEmail: string): Promise<Order[]> {
		const data = await this.dbClient.query({
			TableName: this.ordersDb,
			KeyConditionExpression: 'pk = :email',
			ExpressionAttributeValues: {
				':email': pkEmail,
			},
		}).promise();

		return data.Items as Order[];
	}

	async getByPkAndSk(pkEmail: string, skId: string): Promise<Order | null> {
		const data = await this.dbClient.get({
			TableName: this.ordersDb,
			Key: { pk: pkEmail, sk: skId },
		}).promise();

		if (!data.Item) {
			return null;
		}

		return data.Item as Order;
	}

	async delete(pkEmail: string, skId: string): Promise<Order | null> {
		const data = await this.dbClient.delete({
			TableName: this.ordersDb,
			Key: { pk: pkEmail, sk: skId },
			ReturnValues: 'ALL_OLD',
		}).promise();

		if (data.Attributes) {
			return data.Attributes as Order;
		}

		return null;
	}
}

