#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack,
	EcommerceApiStack,
	ProductAppLayersStack,
	EventsDbStack,
	OrdersAppLayerStack,
	OrdersAppStack
} from '../lib';

const app = new cdk.App();

const env: cdk.Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	cost: 'ECommerce',
	team: 'FTech'
};

const config = {
	env,
	tags,
};

const eventsDbStack = new EventsDbStack(app, 'EventsDb', config);

const productAppLayersStack = new ProductAppLayersStack(app, 'ProductAppLayers', config);

const ordersAppLayersStack = new OrdersAppLayerStack(app, 'OrdersAppLayers', config);

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
	...config,
	eventsDb: eventsDbStack.table
});
productsAppStack.addDependency(eventsDbStack);
productsAppStack.addDependency(productAppLayersStack);
// dependencia acima (layer)
// somente para garantir que a stack de layers seja criada antes da stack de produtos
// pois não há uma dependência direta entre ambos

const ordersAppStack = new OrdersAppStack(app, 'OrdersApp', {
	...config,
	productsDb: productsAppStack.productsDb,
	eventsDb: eventsDbStack.table
});
ordersAppStack.addDependency(productsAppStack);
ordersAppStack.addDependency(ordersAppLayersStack);
ordersAppStack.addDependency(eventsDbStack);

const ecommerApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
	...config,
	productsFetchHandler: productsAppStack.productsFetchHandler,
	productsAdminHandler: productsAppStack.productsAdminHandler,
	ordersHandler: ordersAppStack.ordersHandler,
});
ecommerApiStack.addDependency(productsAppStack);
