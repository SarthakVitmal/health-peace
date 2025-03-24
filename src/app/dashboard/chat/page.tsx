"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Loader2, Bot, User, X, Plus } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const MindeaseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
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
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: inputMessage })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const botResponse = data.message; 
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await fetch('/api/session-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });
      setMessages([]);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleInputResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <ChevronLeft className="text-gray-600 hover:text-gray-900" size={24} />
          </Link>
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-full mr-3">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mental Bot</h1>
              <p className="text-xs text-gray-500">
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleEndSession}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <X size={18} />
          <span>End Session</span>
        </button>
      </header>

      {/* Enhanced Chat Container */}
      <div 
        ref={chatContainerRef} 
        className="flex-grow overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-white/50 to-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <Bot className="text-blue-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Mental Bot</h2>
            <p className="text-gray-600 max-w-md">
              I'm here to support your mental wellbeing. Feel free to share what's on your mind.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 mt-1 mx-2 ${msg.sender === 'user' ? 'hidden' : ''}`}>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Bot className="text-blue-500" size={16} />
                </div>
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className={`flex-shrink-0 mt-1 mx-2 ${msg.sender === 'bot' ? 'hidden' : ''}`}>
                <div className="bg-blue-500 p-2 rounded-full">
                  <User className="text-white" size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
              <div className="flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-gray-600">Mental Bot is typing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Plus className="text-gray-500" size={20} />
          </button>
          <div className="relative flex-grow">
            <textarea 
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleInputResize();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full resize-none p-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto bg-white"
              rows={1}
            />
            <div className="absolute right-2 bottom-2">
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`p-2 rounded-full transition-colors ${
                  isLoading || !inputMessage.trim()
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Mental Bot may produce inaccurate information. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default MindeaseChatbot;