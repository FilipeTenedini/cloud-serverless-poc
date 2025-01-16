<details>
<summary>Comandos</summary>

- **AWS CDK**
  <details>
  <summary>Expandir</summary>

  - **cdk bootstrap**
    - Comando só precisa ser executado uma única vez por conta e região
    - Ele é responsável por criar uma infraestrutura na aws na sua conta e na sua região, pra preparar o cdk poder fazer outras instalações/outros deploys

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

  - A pasta `.bin` é a entrada principal do nosso projeto. Quando o projeto for executado, ele será iniciado a partir dela.
  - Essa pasta contém o arquivo responsável por inicializar a execução das stacks e recursos no projeto.
  - Por padrão, ao rodar o projeto com o CDK, ele buscará essa pasta para identificar qual stack inicial será executada.
  - O arquivo dentro de `.bin` normalmente segue o padrão de instanciar a aplicação e as stacks, como exemplificado abaixo:

    ```typescript
    const app = new App();
    new EcomerceAwsStack(app, 'EcomerceAwsStack', {});
    ```

  </details>

- ### Lambda functions

  <details>
  <summary>Expandir</summary>

  - Funções (pequenos trechos de código) que são executados a partir de triggers disparados por eventos.
    - Exemplo de evento:
      - Requisição REST feita por um cliente de fora da AWS para executar a função dentro da nossa infraestrutura.
    - A Lambda é executada dentro de um ambiente de execução que possui tudo que é necessário para nossa função ser executada.
    - Concorrência:
      - Lambdas são concorrentes, então caso haja requisições ao mesmo tempo é possível tratar ambas.
    - Custo:
      - Tempo de execução e memória consumida. Por isso, devemos nos importar com performance e eficiência.

    - **Exemplo de implementação simples de uma Lambda:**

      ```typescript
      import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

      export async function handler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
          const { httpMethod, requestContext: { requestId: apiRequestId } } = event;
          const { awsRequestId: lambdaRequestId } = ctx;

          console.log(`API Gateway Request ID: ${apiRequestId} - Lambda Request ID: ${lambdaRequestId}`);

          if (event.resource === '/products' && httpMethod === 'GET') {
              console.log('GET /products');

              return {
                  statusCode: 200,
                  body: JSON.stringify({
                      message: 'GET /products successfully returned (hello CDK)'
                  })
              };
          }

          return {
              statusCode: 400,
              body: JSON.stringify({
                  message: 'Bad Request'
              })
          };
      }
      ```

  </details>

- ### Api Gateway

  <details>
  <summary>Expandir</summary>

  - Recurso que podemos colocar na frente de serviços que expõem APIs para o mundo externo, como por exemplo:
    - uma função Lambda que expõe um endpoint REST para ser consumido por algum cliente (aplicação mobile/web).
  - Por que utilizar API Gateway e não chamar diretamente o endpoint?
    - **Validação da URI**:
        - Ele consegue, por exemplo, validar se a URI está correta e impedir que essa requisição chegue até outro endpoint ou que requisições com outro endereço cheguem à nossa função.
    - **Validação de verbos HTTP**
    - **Validação do body**
    - **Integração com outros recursos da AWS**, como o AWS Cognito.
    - **Gráficos de monitoramento**:
        - Logs e gráficos no CloudWatch.
        - Custo por requisição e quantidade de dados transferidos.

  </details>

- ### Lambda Layers

  <details>
  <summary>Expandir</summary>

  - Recurso que permite organizar pedaços de código e/ou bibliotecas que podem ser compartilhados entre várias funções Lambda.
  - **Vantagens de usar Lambda Layer**:
    - Reduz duplicação de código, centralizando funções e lógica comuns.
    - Facilita atualizações, já que alterações no Layer impactam todas as Lambdas associadas.
    - Melhora a manutenção e a organização do código.
  - **Exemplo de uso de Lambda Layer**:
    - **Validação de dados**: Lógica comum para validar inputs de diferentes Lambdas.
    - **Configuração de banco de dados**: Centralizar conexões e setups para várias Lambdas que utilizam o mesmo banco.
    - **Funções utilitárias**: Métodos como formatação de strings, cálculo de datas, ou geração de IDs.
  - **Como implementar**:
    - Criar o Lambda Layer como um pacote independente.
    - Configurar as Lambdas para usar o Layer na hora da implantação.
    - Exemplo de estrutura com Layers:
      ```plaintext
      ├── Lambda Layer
      │   ├── Validação de Dados
      │   ├── Configuração de Banco
      │   └── Funções Utilitárias
      ├── lambda-products-fetch
      │   ├── Get All Products
      │   └── Get Product By ID
      ├── lambda-products-admin
          ├── Create Product
          ├── Update Product
          └── Delete Product
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
