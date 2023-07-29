"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useTextStore } from "@/lib/store";
import MessageBalloon from "./MessageBalloon";
import { ChatRequest, FunctionCallHandler } from "ai";

type Props = {};

const functionCallHandler: FunctionCallHandler = async (
  chatMessages,
  functionCall
) => {
  console.warn(functionCall);

  if (functionCall.name === "calculator") {
    if (functionCall.arguments) {
      const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
      // You now have access to the parsed arguments here (assuming the JSON was valid)
      // If JSON is invalid, return an appropriate message to the model so that it may retry?
      alert("ok");
    }

    // Generate a fake temperature

    const functionResponse: ChatRequest = {
      messages: [
        ...chatMessages,
        // {
        //   id: nanoid(),
        //   name: 'get_current_weather',
        //   role: 'function' as const,
        //   content: JSON.stringify({
        //     temperature,
        //     weather,
        //     info: 'This data is randomly generated and came from a fake weather API!'
        //   })
        // }
      ],
    };
    return functionResponse;
  }
};

const Chat: FC<Props> = ({}) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
    isLoading,
  } = useChat({
    experimental_onFunctionCall: functionCallHandler,
  });
  const [active, setActive] = useState(false);
  const { text } = useTextStore();

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  console.log("messages ->", JSON.stringify(messages, null, 2));

  const startChat = async () => {
    setActive(true);
    if (messages.length === 0 && !isLoading) {
      console.log("hey ->", JSON.stringify("hey", null, 2));
      await append({
        role: "system",
        content:
          "Sen yardımsever bir asistansın. Konuşmanın en başında nazik bir karşılama cümlesi ile birlikte bu doküman ile ilgili 10 adet soru örneği göster",
        id: "onboarding",
        createdAt: new Date(),
      });
    }
  };

  useEffect(() => {
    setActive(false);
    setMessages([]);
  }, [text]);

  return (
    <div className="w-full flex flex-col relative">
      {active ? (
        <>
          <div className="w-full shrink-0 h-[calc(100vh-8rem)] flex flex-col gap-6 overflow-auto overflow-x-hidden">
            {messages
              .filter((m) => m.id !== "onboarding")
              .map((m) => (
                <MessageBalloon m={m} key={m.id} />
              ))}
            <div ref={divRef}></div>
          </div>
        </>
      ) : (
        <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center overflow-x-hidden">
          <button onClick={() => startChat()} className="btn btn-lg">
            Start Chat
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className={`h-15 border-t-2 flex flex-row gap-4 pt-4 w-full mt-6 transition-all ${
            active ? "translate-y-0" : "translate-y-20"
          }`}
        >
          <input
            className="w-full bg-white border-slate-400 rounded-md p-2 h-full border-2"
            placeholder="Say something..."
            value={input}
            onChange={handleInputChange}
          />
          <button type="submit" className="btn">
            SEND
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
