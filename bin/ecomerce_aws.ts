#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack, EcommerceApiStack } from '../lib';

const app = new cdk.App();

const env: cdk.Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
	cost: 'ECommerce',
	team: 'FTech'
};

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
	env,
	tags,
});

const ecommerApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
	productsFetchHandler: productsAppStack.productsFetchHandler,
	env,
	tags
});
ecommerApiStack.addDependency(productsAppStack);
