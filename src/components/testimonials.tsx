import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

interface TestimonialProps {
  quote: string
  name: string
  title: string
  avatar: string
}

const Testimonial = ({ quote, name, title, avatar }: TestimonialProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-8 flex flex-col h-full">
        <div className="mb-6 text-indigo-600">
          <Quote className="h-8 w-8" />
        </div>
        <p className="flex-1 text-gray-600 text-lg mb-8 italic">"{quote}"</p>
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-4 border-2 border-indigo-100">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-gray-800">{name}</p>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Testimonials = () => {
  const testimonials = [
    {
      quote: "This AI chatbot has been a lifeline for me during late nights when I needed someone to talk to. The mood tracking feature helps me understand my emotional patterns.",
      name: "Alex Johnson",
      title: "User for 6 months",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    {
      quote: "I appreciate the privacy this platform offers. Being able to discuss my feelings anonymously has helped me open up in ways I couldn't before.",
      name: "Sam Rivera",
      title: "User for 3 months",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    {
      quote: "The playlist suggestions are surprisingly effective at helping me manage my anxiety. It's like having a therapist and a DJ in one app!",
      name: "Taylor Kim",
      title: "User for 1 year",
      avatar: "/placeholder.svg?height=48&width=48",
    },
  ]

  return (
    <section id="testimonials" className="py-20 flex justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              What Our Users Say
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from people who have found support and guidance through our platform.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials