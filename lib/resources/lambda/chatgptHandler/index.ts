import lambda from "aws-lambda";
import { Configuration, OpenAIApi } from "openai";

const apiKey = process.env.CHATGPT_API_KEY || "";

export const handler = async () => {
  const answer = await askChatGpt({
    content: "hello, chatgpt. how do you do?",
  });
  const response: lambda.APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify({ result: "success", message: answer }),
  };
  return response;
};

const askChatGpt = async ({ content }: { content: string }) => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: [{ role: "user", content }],
  });

  const answer =
    response.data.choices[0].message?.content ||
    "[from lambda function itself] no response.";
  return answer;
};
