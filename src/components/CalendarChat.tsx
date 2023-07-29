import { FunctionCallHandler, ChatRequest } from "ai";
import { useChat } from "ai/react";
import { addHours, parseISO } from "date-fns";
import { FC, useEffect, useRef, useState } from "react";
import ApiCalendar from "react-google-calendar-api";
import MessageBalloon from "./MessageBalloon";

type Props = {};

const config = {
  clientId:
    "718969978098-l19trdis617tiouia8mmkn97tfg3uefj.apps.googleusercontent.com",
  apiKey: "AIzaSyCvx1lTwX-dv2AALG11IIu6dEeRiUXla5s",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const apiCalendar = new ApiCalendar(config);

const CalendarChat: FC<Props> = ({}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const [iframeSrc, setIframeSrc] = useState(
    "https://calendar.google.com/calendar/embed?src=falsemech%40gmail.com&ctz=Europe%2FIstanbul"
  );
  const [active, setActive] = useState(false);

  const startChat = async () => {
    setActive(true);
  };

  const handleClick = async () => {
    try {
      apiCalendar.handleAuthClick();
    } catch (error) {
      console.error(error);
    }
  };

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === "make_appointment") {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);

        const dateStr: string = parsedFunctionCallArguments.date;
        console.log("date ->", dateStr);

        const title: string = parsedFunctionCallArguments.title;
        console.log("title ->", title);

        const startDate: Date = dateStr.includes("T")
          ? parseISO(dateStr)
          : new Date(dateStr);
        const endDate: Date = addHours(startDate, 2);

        console.log("startDate ->", JSON.stringify(startDate, null, 2));
        console.log("endDate ->", JSON.stringify(endDate, null, 2));

        const eventConfigObj = {
          summary: title ?? "Event With Google",
          start: {
            dateTime: startDate.toISOString().replace("Z", ""),
            timeZone: "Europe/Istanbul",
          },
          end: {
            dateTime: endDate.toISOString().replace("Z", ""),
            timeZone: "Europe/Istanbul",
          },
        };

        try {
          await apiCalendar.createEvent(eventConfigObj);

          setIframeSrc("");
          setTimeout(
            () =>
              setIframeSrc(
                "https://calendar.google.com/calendar/embed?src=falsemech%40gmail.com&ctz=Europe%2FIstanbul"
              ),
            1000
          );
        } catch (error) {
          console.error("GAPI -> ", error);
        }
      }
    }

    if (functionCall.name === "delete_appointment") {
      if (functionCall.arguments) {
        const { title } = JSON.parse(functionCall.arguments);

        console.log("title ->", title);

        try {
          const { result } = await apiCalendar.listEvents({
            q: title,
          });
          console.log("result ->", JSON.stringify(result, null, 2));
          if (result.items && result.items.length > 0) {
            const ev = result.items[0];
            await apiCalendar.deleteEvent(ev.id);
          }

          setIframeSrc("");
          setTimeout(
            () =>
              setIframeSrc(
                "https://calendar.google.com/calendar/embed?src=falsemech%40gmail.com&ctz=Europe%2FIstanbul"
              ),
            1000
          );
        } catch (error) {
          console.error("GAPI -> ", error);
        }
      }
    }

    // Generate a fake temperature

    const functionResponse: ChatRequest = {
      messages: chatMessages,
    };
    return functionResponse;
  };

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
    api: "/api/calendar",
  });

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="w-full grid grid-cols-3 overflow-hidden">
      <div className="w-full flex flex-col gap-4 border-r-2 col-span-2">
        <div className="flex items-center justify-center h-32 border-b-2">
          <button className="btn" onClick={() => handleClick()}>
            AUTH
          </button>
        </div>
        <div className="w-full h-full overflow-auto p-4">
          <iframe
            src={iframeSrc}
            className="b-0 w-full h-full overflow-auto"
          ></iframe>
        </div>
      </div>

      <div className="w-full h-full p-6">
        <div className="w-full flex flex-col relative">
          {active ? (
            <>
              <div className="w-full shrink-0 h-[calc(100vh-8rem)] flex flex-col gap-6 overflow-auto overflow-x-hidden">
                {messages
                  .filter((m) => !m.function_call)
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
      </div>
    </div>
  );
};

export default CalendarChat;
