#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack, EcommerceApiStack, ProductAppLayersStack, EventsDbStack } from '../lib';

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

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
	...config,
	eventsDb: eventsDbStack.table
});
productsAppStack.addDependency(productAppLayersStack);
productsAppStack.addDependency(eventsDbStack);
// dependencia acima
// somente para garantir que a stack de layers seja criada antes da stack de produtos
// pois não há uma dependência direta entre ambos

const ecommerApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
	...config,
	productsFetchHandler: productsAppStack.productsFetchHandler,
	productsAdminHandler: productsAppStack.productsAdminHandler,
});
ecommerApiStack.addDependency(productsAppStack);
