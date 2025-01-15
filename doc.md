<details>
<summary>Comandos</summary>

- **AWS CDK**
  <details>
  <summary>Expandir</summary>

  - **cdk list**
    - Visualizar nosso projeto para saber quais stacks temos dentro do projeto.
    - O nome listado é o que está como segundo parâmetro da instância da classe na pasta `bin`.

      ```typescript
      new EcomerceAwsStack(app, 'EcomerceAwsStack', {});
      ```

  - **cdk deploy --all**
    - Implanta todas as stacks definidas no projeto de uma só vez, criando ou atualizando os recursos na AWS conforme especificado no código.

  - **cdk diff**
    - Compara o estado atual dos recursos na AWS com o que está definido no código do CDK, exibindo as diferenças.

  - **cdk destroy --all**
    - Remove todas as stacks e recursos implantados associados ao projeto, garantindo que nenhum recurso permaneça na AWS.

  </details>

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
