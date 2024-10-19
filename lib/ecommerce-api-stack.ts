import { Stack, type StackProps } from 'aws-cdk-lib';
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RestApi, LambdaIntegration, LogGroupLogDestination, AccessLogFormat } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { type Construct } from 'constructs';

interface ECommerceApiStackProps extends StackProps {
  productFetchHandler: NodejsFunction
}

export class ECommerceApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'ECommerceApiLogs');

    const api = new RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          protocol: true,
          ip: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      }
    });

    const productsFetchIntegration = new LambdaIntegration(props.productFetchHandler);

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', productsFetchIntegration);
  }
}
