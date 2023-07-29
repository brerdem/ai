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
    name: "make_appointment",
    description: "Makes an appointment or creates event in Google Calendar",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description:
            "Start date of the event or appointment. Should be Date ISO string",
        },
        title: {
          type: "string",
          description: "Compose a title from the event or appointment",
        },
      },
      required: ["date", "title"],
    },
  },
  {
    name: "delete_appointment",
    description: "Returns the title of the event or appointment for deletion",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Compose a title from the event or appointment",
        },
      },
      required: ["title"],
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
