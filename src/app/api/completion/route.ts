import { ChatCompletionFunctions, Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = "edge";

const functions: ChatCompletionFunctions[] = [
  {
    name: "open_website",
    description: "Opens the website in a new tab",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL of the website",
        },
      },
      required: ["url"],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages,
    functions,
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
