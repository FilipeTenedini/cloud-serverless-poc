<details>
<summary>Comandos</summary>

-
-
-

</details>

<details>
<summary>Anotações</summary>

- a pasta ```.bin``` é a entrada do nosso projeto, quando for executado o projeto será a partir dela
-
-

</details>

<details>
<summary>Exemplos</summary>

- Entendendo a classe que representa uma stack
    - toda classe que extende de cdk.Stack é/representa uma stack e aqui dentro podemos definir nossos recursos
```ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EcomerceAwsStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here
	}
}

```

-
-

</details>
