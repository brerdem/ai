"use client";

import dynamic from "next/dynamic";

const CalendarChat = dynamic(() => import("@/components/CalendarChat"), {
  ssr: false,
});

export default function Calendar() {
  return (
    <div className="w-full h-screen">
      <CalendarChat />
    </div>
  );
}
