"use client";

import { AlertOctagon, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { ChatResponse } from "@/app/api/chat/route";

type ChatMessage =
  | {
      type: "user";
      message: string;
    }
  | {
      type: "error";
      message: string;
    };

export function Chat() {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);

  return (
    <div className="flex flex-col grow bg-gray-100">
      <ScrollArea className="grow h-10 px-3 border-b border-foreground">
        <div className="flex flex-col py-2 gap-2">
          {chat.map((m, i) =>
            m.type === "user" ? (
              <Card key={i} className="py-4 border border-foreground">
                <CardHeader>
                  <div className="flex gap-3">
                    <div className="bg-foreground size-8 rounded-full" />
                    <CardTitle className="mt-2">{m.message}</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ) : m.type === "error" ? (
              <Card key={i} className="py-4 border border-foreground">
                <CardHeader>
                  <div className="flex gap-3">
                    <AlertOctagon className="size-8 text-red-600" />
                    <CardTitle className="mt-2 text-red-600">
                      {m.message}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <></>
            )
          )}
        </div>
        <ScrollBar />
      </ScrollArea>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChat((chat) => [
            ...chat,
            {
              type: "user",
              message: message,
            },
          ]);
          setMessage("");
          fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
              input: message,
            }),
          })
            .then((res) => res.json() as Promise<ChatResponse>)
            .then((data) => {
              if (data.success) {
                setChat((chat) => [
                  ...chat,
                  {
                    type: "user",
                    message: `${data.query}: ${data.data}`,
                  },
                ]);
              } else {
                setChat((chat) => [
                  ...chat,
                  {
                    type: "error",
                    message: data.error,
                  },
                ]);
              }
            });
        }}
        className="flex m-2 gap-1 h-12"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-background border border-foreground h-12"
        />
        <Button type="submit" className="h-12">
          <ArrowRight className="size-6" />
        </Button>
      </form>
    </div>
  );
}
