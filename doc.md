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

- ### A pasta bin

  <details>
  <summary>Expandir</summary>
  
    - A pasta ```.bin``` é a entrada principal do nosso projeto. Quando o projeto for executado, ele será iniciado a partir dela.
    - Essa pasta contém o arquivo responsável por inicializar a execução das stacks e recursos no projeto.
    - Por padrão, ao rodar o projeto com o CDK, ele buscará essa pasta para identificar qual stack inicial será executada.
    - O arquivo dentro de ```.bin``` normalmente segue o padrão de instanciar a aplicação e as stacks, como exemplificado abaixo:

    ```typescript
    const app = new App();
    new EcomerceAwsStack(app, 'EcomerceAwsStack', {});
    ```

  </details>

- ### Lamba functions
  <details>
  <summary>Expandir</summary>

  - Funções (pequenos trechos de código) que são executados a partir de triggers disparados por eventos.
    - exemplo de evento:
        - requisição rest feita por um client de fora da aws para executar a função dentro da nossa infraestrutura
        - a lambda é executada dentro de um ambiente de execução que possui tudo que é necessário para nossa função ser executada
    - concorrência:
        - lambdas são concorrentes então caso haja requisições ao mesmo tempo é possível tratar ambas
    - custo:
        - tempo de de execução e memória consumida, logo, devemos nos importar com performance, execução e etc.

  -
  -

    ```typescript

    ```

  </details>

</details>

<details>
<summary>Exemplos</summary>

- **Entendendo a classe que representa uma stack**
  - Toda classe que estende de `cdk.Stack` é ou representa uma stack, e dentro dela podemos definir nossos recursos e configurações.
  <details>
  <summary>Expandir</summary>

  - O `cdk.Stack` é a estrutura base no AWS CDK para definir recursos e configurações de infraestrutura.
  - A classe que estende `cdk.Stack` permite configurar e definir os recursos que serão provisionados na AWS, como buckets S3, filas SQS, etc.
  - O exemplo abaixo mostra a estrutura básica de uma classe de stack que pode ser estendida para adicionar mais recursos conforme necessário.

    ```typescript
    import * as cdk from 'aws-cdk-lib';
    import { Construct } from 'constructs';

    export class EcomerceAwsStack extends cdk.Stack {
        constructor(scope: Construct, id: string, props?: cdk.StackProps) {
            super(scope, id, props);

            // O código que define seus recursos vai aqui
            // Exemplo: criar uma fila SQS ou um bucket S3
        }
    }
    ```

  </details>

</details>
