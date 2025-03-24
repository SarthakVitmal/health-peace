"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Loader2, Bot, User, X, Plus, Moon, Sun } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const MindeaseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.message,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, text: "Sorry, an error occurred. Please try again.", sender: "bot", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      setMessages([]);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleInputResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div data-theme={darkMode ? "dark" : "light"} className="flex flex-col h-screen transition-all">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-opacity-80 backdrop-blur-md border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 hover:bg-opacity-20 p-1 rounded-full transition">
            <ChevronLeft className="size-6" />
          </Link>
          <div className="flex items-center">
            <div className="p-2 rounded-full mr-3">
              <Bot className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Mental Bot</h1>
              <p className="text-xs">{isTyping ? "Typing..." : "Online"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 bg-black hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <X size={18} />
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="size-12 mb-4" />
            <h2 className="text-2xl font-bold">Welcome to Mental Bot</h2>
            <p className="text-sm">I'm here to support your mental wellbeing. Feel free to share what's on your mind.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex max-w-[80%]">
              <div className={`p-3 rounded-xl ${msg.sender === "user" ? "bg-slate-200 text-black" : "bg-gray-200 text-black"}`}>
                <p>{msg.text}</p>
                <p className="text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 p-4 border-t bg-white bg-opacity-80 backdrop-blur-md">
  <div className="flex items-end gap-2 w-full">
    {/* Attachment button */}
    <button 
      className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
      aria-label="Add attachment"
    >
      <Plus className="w-5 h-5 text-gray-600" />
    </button>

    {/* Input container */}
    <div className="relative flex-grow flex items-end">
      <textarea
        ref={inputRef}
        value={inputMessage}
        onChange={(e) => {
          setInputMessage(e.target.value);
          handleInputResize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Type your message..."
        className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none"
        rows={1}
      />
      
      {/* Send button */}
      <button 
        onClick={handleSendMessage} 
        disabled={isLoading || !inputMessage.trim()} 
        className={`absolute right-2 bottom-2 p-1 rounded-full transition-colors ${
          isLoading || !inputMessage.trim()
            ? "text-gray-400"
            : "text-blue-600 hover:text-blue-700"
        }`}
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
</div>
    </div>
  );
};

export default MindeaseChatbot;
