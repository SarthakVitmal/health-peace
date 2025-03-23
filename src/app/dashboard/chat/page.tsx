"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function Chat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ text: string; response: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { text: input, response: "" };
    setMessages((prev) => [...prev, userMessage]);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.email, prompt: input }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.reply) {
      setMessages((prev) => [...prev, { text: input, response: data.reply }]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800">Chat History</h2>
      </div>

      <div className="flex-1 flex flex-col p-6">
        <div className="h-1/2 overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow-md">
          {messages.map((msg, index) => (
            <div key={index} className="space-y-2">
              <div className="text-right">
                <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
                  {msg.text}
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  {msg.response}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}