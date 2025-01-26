import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class EventsDbStack extends cdk.Stack {
	readonly eventsDb: dynamodb.Table;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		this.eventsDb = new dynamodb.Table(this, 'EventsTable', {
			tableName: 'events',
			/* esse recurso o padrão é que não seja destruído ao rodar um destroy para não perder os dados.
            nesse momento deixaremos como destroy para facilitar a limpeza do ambiente.*/
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO
			writeCapacity: 1, // QUANTAS REQUISIÇÕES POR SEGUNDO

			// diferenças da outra tabela de produto para essa \/
			partitionKey: {
				name: 'pk',
				type: dynamodb.AttributeType.STRING,
			},
			sortKey: {
				name: 'sk',
				type: dynamodb.AttributeType.STRING,
			},
			timeToLiveAttribute: 'ttl',

		});
	}
}