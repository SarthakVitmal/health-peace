"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, Send, Loader2, Bot, X, Plus, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const MindeaseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [speechSupported, setSpeechSupported] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Check for speech synthesis support
  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || 
         "webkitSpeechRecognition" in window) &&
        "speechSynthesis" in window
    )
    
    // Initialize speech recognition
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")
        setInputMessage(transcript)
        handleInputResize()
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
        toast.error("Voice input error: " + event.error)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (!speechSupported) {
      toast.warning("Voice input is not supported in your browser")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      toast.info("Voice input stopped")
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        toast.info("Listening... Speak now")
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        toast.error("Failed to start voice input")
      }
    }
  }

  const toggleSpeechOutput = () => {
    if (!speechSupported) {
      toast.warning("Voice output is not supported in your browser")
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      toast.info("Voice output turned off")
    } else {
      setIsSpeaking(true)
      toast.info("Voice output turned on")
      // Speak the last bot message if there is one
      const lastBotMessage = [...messages].reverse().find(m => m.sender === "bot")
      if (lastBotMessage) {
        speakMessage(lastBotMessage.text)
      }
    }
  }

  const speakMessage = (text: string) => {
    if (!isSpeaking || !speechSupported) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onend = () => {
      speechSynthesisRef.current = null
    }
    
    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (!response.ok) throw new Error("Network error")

      const data = await response.json()
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.message,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      
      // Speak the response if speech output is enabled
      if (isSpeaking) {
        speakMessage(data.message)
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, an error occurred. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      toast.error("Failed to get response from the bot")
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleEndSession = async () => {
    try {
      await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
      setMessages([])
      toast.success("Session ended and summary saved")
    } catch (error) {
      console.error("Error ending session:", error)
      toast.error("Failed to end session")
    }
  }

  const handleInputResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="top-15 z-10 bg-white shadow-sm border-b p-4 flex items-center justify-between sticky w-full">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 hover:bg-neutral-100 p-2 rounded-full transition">
            <ChevronLeft className="size-5 text-neutral-700" />
          </Link>
          <div className="flex items-center">
            <div className="p-2 bg-emerald-50 rounded-full mr-3">
              <Bot className="size-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">MindEase</h1>
              <p className="text-xs text-neutral-500">{isTyping ? "Typing..." : "Online"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {speechSupported && (
            <Button 
              onClick={toggleSpeechOutput}
              variant={isSpeaking ? "default" : "outline"}
              size="icon"
              className={`rounded-full ${isSpeaking ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-neutral-600'}`}
              aria-label={isSpeaking ? "Turn off voice output" : "Turn on voice output"}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          )}
          <Button 
            onClick={handleEndSession} 
            variant="destructive" 
            className="flex items-center gap-2" 
            size="sm"
          >
            <X size={16} />
            <span>End Session</span>
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="p-4 bg-emerald-50 rounded-full mb-4">
              <Bot className="size-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to MindEase</h2>
            <p className="text-neutral-600 max-w-md">
              I'm here to support your mental wellbeing. Feel free to share what's on your mind or use the microphone to
              speak directly to me.
            </p>
            {!speechSupported && (
              <p className="text-sm text-orange-600 mt-4">
                Note: Voice features are not supported in your current browser. Try Chrome or Edge for full functionality.
              </p>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex max-w-[80%]">
              <Card
                className={`p-2 h-fit border-0 shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-purple-200 text-black" 
                    : "bg-white text-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === "user" ? "text-neutral-600" : "text-neutral-400"
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </Card>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <Card className="p-3 border-0 shadow-sm bg-white">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 p-3 border-t bg-white shadow-md">
        <div className="flex items-end gap-2 w-full max-w-4xl mx-auto">
          {/* Voice input button */}
          {/* {speechSupported && (
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={`rounded-full flex-shrink-0 ${
                isListening ? 'bg-red-500 hover:bg-red-600' : 'text-neutral-600'
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          )} */}

          {/* Input container */}
          <div className="relative flex-grow flex items-end">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                handleInputResize()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={isListening ? "Listening... (speak now)" : "Type your message..."}
              className="w-full p-3 pr-12 min-h-[50px] max-h-[150px] border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={1}
            />

            {/* Send button */}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              variant="ghost"
              className={`absolute right-2 bottom-2 p-1 rounded-full ${
                isLoading || !inputMessage.trim()
                  ? "text-neutral-400"
                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MindeaseChatbot
