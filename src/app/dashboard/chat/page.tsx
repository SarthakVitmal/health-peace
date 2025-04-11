"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, Send, Loader2, Bot, X, Plus, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { usePathname, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(true)
  const [speechSupported, setSpeechSupported] = useState<boolean>(true)
  const [showEndSessionModal, setShowEndSessionModal] = useState<boolean>(false)
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()

        if (response.ok) {
          setUserId(data.user._id)
        } else {
          toast.error("Session expired. Please login again.")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Session expired. Please login again.")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Check for speech synthesis support
  useEffect(() => {
    // Check for speech synthesis support
    const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window

    if (!hasSpeechSynthesis) {
      toast.warning("Voice output is not supported")
    }

    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
      stopRecording()
    }
  }, [])

  // Setup and handle microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = processAudio
      mediaRecorder.start()
      setIsRecording(true)
      toast.info("Speak now...")
    } catch (error) {
      toast.error("Microphone access denied")
      setIsListening(false)
    }
  }


  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const processAudio = async () => {
    if (!audioChunksRef.current.length) {
      toast.warning("No audio recorded")
      return
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const response = await fetch('/api/whisper', { method: 'POST', body: formData })
      const { text } = await response.json()

      if (text) {
        setInputMessage(text)
        toast.success("Voice message ready")
      } else {
        toast.warning("No speech detected")
      }
    } catch (error) {
      toast.error("Failed to process speech")
    } finally {
      audioChunksRef.current = []
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (isListening) stopRecording()
    else {
      setIsListening(true)
      startRecording()
    }
  }

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (sessionId) { // Only show warning if session is active
      e.preventDefault()
      e.returnValue = 'You have an active chat session. Are you sure you want to leave?'
      return e.returnValue
    }
  }, [sessionId])

  // Setup event listeners for page navigation
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handleBeforeUnload])

  // Handle router navigation (Next.js)
  useEffect(() => {
    // This effect runs whenever the pathname changes
    if (sessionId && !pathname.includes('/chat') && !showEndSessionModal) {
      setShowExitWarning(true);
      // Note: You can't directly throw to abort navigation in App Router
    }
  }, [pathname, sessionId, showEndSessionModal]);

  const toggleSpeechOutput = () => {
    if (!('speechSynthesis' in window)) {
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
    if (!isSpeaking || !('speechSynthesis' in window)) return

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

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!userId) return

      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })

        if (!response.ok) {
          throw new Error('Failed to create session')
        }

        const data = await response.json()
        setSessionId(data.sessionId)
      } catch (error) {
        console.error("Failed to start session:", error)
        toast.error("Failed to start chat session")
      }
    }

    initializeSession()

    return () => {
      if (sessionId) {
        endSession()
      }
    }
  }, [userId])

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
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          userId
        }),
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

  const confirmEndSession = () => {
    setShowEndSessionModal(true)
  }

  const endSession = async () => {
    if (!sessionId) return

    setIsEndingSession(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/summary`, {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to end session")
      }

      toast.success("Session ended successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error ending session:", error)
      toast.error("Failed to end session")
    } finally {
      setIsEndingSession(false)
      setShowEndSessionModal(false)
    }
  }

  const handleInputResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="flex flex-col h-screen bg-indigo-50">
      <Dialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Active Session Detected</DialogTitle>
            <DialogDescription>
              You have an active chat session. Would you like to end the session properly
              to save your progress before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowExitWarning(false)
                router.push('/dashboard')
              }}
            >
              Leave Without Saving
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowExitWarning(false)
                setShowEndSessionModal(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              End Session Properly
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <header className="z-10 bg-white shadow-sm border-b p-4 flex items-center justify-between sticky w-full top-0">
        <div className="flex items-center">
          <Button
            onClick={confirmEndSession}
            variant="ghost"
            className="mr-4 p-2 rounded-full transition hover:bg-neutral-100"
            aria-label="Go back and end session"
          >
            <ChevronLeft className="size-5 text-neutral-700" />
          </Button>
          <div className="flex items-center">
            <div className="p-2 bg-indigo-50 rounded-full mr-3">
              <Bot className="size-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-md md:text-xl font-semibold text-neutral-800">SerenityBot</h1>
              <p className="text-xs text-neutral-500">{isTyping ? "Typing..." : "Online"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {('speechSynthesis' in window) && (
            <Button
              onClick={toggleSpeechOutput}
              variant={isSpeaking ? "default" : "outline"}
              size="icon"
              className={`rounded-full ${isSpeaking ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-neutral-600'}`}
              aria-label={isSpeaking ? "Turn off voice output" : "Turn on voice output"}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          )}
          <Button
            onClick={confirmEndSession}
            variant="destructive"
            className="flex items-center gap-2"
            size="sm"
          >
            <X size={16} />
            <span>End</span>
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <Bot className="size-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Welcome to SerenityBot</h2>
            <p className="text-neutral-600 max-w-md">
              I'm here to support your mental wellbeing. Feel free to share what's on your mind or use the microphone to
              speak directly to me.
              Please end the session when you're done.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex max-w-[60%]">
              <Card
                className={`p-2 h-fit border-0 shadow-sm${msg.sender === "user"
                  ? " bg-indigo-400 text-white"
                  : " bg-white text-neutral-800"
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-neutral-100" : "text-neutral-400"
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
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 p-3 border-t bg-white shadow-md">
        <div className="flex items-end gap-2 w-full max-w-4xl mx-auto">
          {/* Voice input button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`rounded-lg h-[50px] w-[50px] flex items-center justify-center ${isListening ? 'bg-red-500 text-white' : 'text-neutral-600'
                    }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="">
                {isListening ? (
                  <p>Click to stop recording<br /><span className="text-xs text-neutral-500">Currently listening...</span></p>
                ) : (
                  <p>Click to speak<br /><span className="text-xs text-neutral-500">Press to record</span></p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
              placeholder={isListening ? "Recording... (speak now)" : "Type your message..."}
              className="w- full p-3 pr-12 min-h-[50px] max-h-[150px] border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-stretch-condensed"
              rows={1}
            />
            {/* Send button */}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              variant="ghost"
              className={`absolute right-2 bottom-2 p-1 rounded-full ${isLoading || !inputMessage.trim()
                ? "text-neutral-400"
                : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      <Dialog open={showEndSessionModal} onOpenChange={setShowEndSessionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this session? A summary will be generated and saved to your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEndSessionModal(false)}
              disabled={isEndingSession}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={endSession}
              disabled={isEndingSession}
            >
              {isEndingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending Session...
                </>
              ) : (
                "End Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MindeaseChatbot