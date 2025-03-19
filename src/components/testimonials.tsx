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
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4 text-primary">
          <Quote className="h-6 w-6" />
        </div>
        <p className="flex-1 text-muted-foreground mb-6">{quote}</p>
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "This AI chatbot has been a lifeline for me during late nights when I needed someone to talk to. The mood tracking feature helps me understand my emotional patterns.",
      name: "Alex Johnson",
      title: "User for 6 months",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "I appreciate the privacy this platform offers. Being able to discuss my feelings anonymously has helped me open up in ways I couldn't before.",
      name: "Sam Rivera",
      title: "User for 3 months",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "The playlist suggestions are surprisingly effective at helping me manage my anxiety. It's like having a therapist and a DJ in one app!",
      name: "Taylor Kim",
      title: "User for 1 year",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-muted/50 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from people who have found support and guidance through our platform.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

