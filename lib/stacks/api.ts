import { CfnOutput, Duration, Names, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ApiStack extends Stack {
  public handler: NodejsFunction;
  public api: RestApi;

  public auth: UserPool;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.handler = new NodejsFunction(scope, `chatgpt-api-handler`, {
      entry: "lib/resources/lambda/chatgptHandler/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        CHATGPT_API_KEY: this.node.tryGetContext("chatGptApiKey"),
      },
      timeout: Duration.minutes(1),
    });

    this.api = new RestApi(scope, `apigateway`, {
      restApiName: `chatgpt-api-gateway`,
      description: "integrated with chatgpt",
    });

    this.auth = new UserPool(scope, "chatgpt-api-authorizer", {
      selfSignUpEnabled: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.auth.addClient("chatgpt-api-userpool-client", {
      generateSecret: false,
      authFlows: { adminUserPassword: true },
    });

    const getAiResponseIntegration = new LambdaIntegration(this.handler, {
      requestTemplates: {
        "application/json": JSON.stringify({ statusCode: 200 }),
      },
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      scope,
      "chatgpt-api-cognitoAuthorizer",
      {
        authorizerName: "chatgpt-api-authorizer",
        cognitoUserPools: [this.auth],
      }
    );
    this.api.root
      .addResource("ai")
      .addMethod("GET", getAiResponseIntegration, { authorizer });

    new CfnOutput(scope, "userpoolid", { value: this.auth.userPoolId });
    new CfnOutput(scope, "apigatewayEndpoint", { value: this.api.url });
  }
}
