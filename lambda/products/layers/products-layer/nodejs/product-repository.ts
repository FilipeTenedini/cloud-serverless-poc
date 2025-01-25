import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Product } from 'types/product';
import { v4 as uuid } from 'uuid';


export class ProductRepository {
	private ddbClient: DocumentClient;
	private productsDdb: string;

	constructor(ddbClient: DocumentClient, productsDdb: string) {
		this.ddbClient = ddbClient;
		this.productsDdb = productsDdb;
	}

	async getAll(): Promise<Product[]> {
		const data = await this.ddbClient.scan({
			TableName: this.productsDdb,
		}).promise();

		return data.Items as Product[];
	}

	async findById(id: string): Promise<Product | null> {
		const data = await this.ddbClient.get({
			TableName: this.productsDdb,
			Key: { id },
		}).promise();

		if (!data.Item) {
			return null;
		}
		return data.Item as Product;
	}

	async create(product: Product): Promise<Product> {
		product.id = uuid();
		await this.ddbClient.put({
			TableName: this.productsDdb,
			Item: product,
		}).promise();

		return product;
	}

	async delete(id: string): Promise<Product | void> {
		const data = await this.ddbClient.delete({
			TableName: this.productsDdb,
			Key: { id },
			// essa propriedade fala que caso o item seja deletado,
			// ele deve retornar o item deletado, mostrando que o item existia e evitando ter que fazer duas consultas
			ReturnValues: 'ALL_OLD'
		}).promise();

		if (data.Attributes) {
			return data.Attributes as Product;
		}
	}

	async update(id: string, product: Product): Promise<Product> {
		const data = await this.ddbClient.update({
			TableName: this.productsDdb,
			Key: { id },
			ConditionExpression: 'attribute_exists(id)',
			UpdateExpression: 'set productName = :productName, price = :price, code = :code, model = :model, productUrl = :productUrl',
			ExpressionAttributeValues: {
				':productName': product.productName,
				':price': product.price,
				':code': product.code,
				':model': product.model,
				':productUrl': product.productUrl,
			},
			ReturnValues: 'UPDATED_NEW',
		}).promise();

		return data.Attributes as Product;
	}
}