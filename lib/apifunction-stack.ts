import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStack } from "./stacks/api";

import * as dotenv from "dotenv";
dotenv.config();
export class ApifunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.node.setContext(
      "chatGptApiKey",
      process.env.CHATGPT_API_KEY as string
    );

    new ApiStack(this, `chatgpt-api`);
  }
}
