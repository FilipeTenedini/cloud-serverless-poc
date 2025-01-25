#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack, EcommerceApiStack, ProductAppLayersStack } from '../lib';

const app = new cdk.App();

const env: cdk.Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	cost: 'ECommerce',
	team: 'FTech'
};

const productAppLayersStack = new ProductAppLayersStack(app, 'ProductAppLayers', {
	env,
	tags,
});

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
	env,
	tags,
});
productsAppStack.addDependency(productAppLayersStack);
// dependencia acima
// somente para garantir que a stack de layers seja criada antes da stack de produtos
// pois não há uma dependência direta entre ambos

const ecommerApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
	productsFetchHandler: productsAppStack.productsFetchHandler,
	productsAdminHandler: productsAppStack.productsAdminHandler,
	env,
	tags
});
ecommerApiStack.addDependency(productsAppStack);
