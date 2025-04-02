import type React from "react"
import { Brain, Shield, Clock, Music, BarChart, Headphones, MessageSquare, BookOpen, UserCircle } from "lucide-react"

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

const Features = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Support",
      description: "Advanced AI models provide natural, empathetic conversations and personalized support.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Access mental health support anytime, anywhere through web and Android applications.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "User Anonymity",
      description: "Maintain your privacy with anonymous conversations and secure data handling.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Mood Tracking",
      description: "Monitor your emotional wellbeing over time with intuitive mood tracking tools.",
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "Playlist Suggestions",
      description: "Receive personalized music recommendations to help manage your mood.",
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Voice Interaction",
      description: "Interact naturally with text-to-speech and speech-to-text capabilities.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat History",
      description: "Review past conversations to track your progress and insights.",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Self-Help Resources",
      description: "Access a library of mental health tips, exercises, and guidance.",
    },
    {
      icon: <UserCircle className="h-6 w-6" />,
      title: "User Authentication",
      description: "Secure login to access your personalized dashboard and settings.",
    },
  ]

  return (
    <section id="features" className="py-20 flex justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              Comprehensive Mental Health Support
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform combines AI technology with mental health expertise to provide a complete support system.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 pt-12">
          {features.map((feature, index) => (
            <Feature key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features