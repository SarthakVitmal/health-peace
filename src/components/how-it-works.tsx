import Image from "next/image"

const HowItWorks = () => {
  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up anonymously and set your preferences for a personalized experience.",
    },
    {
      title: "Start a Conversation",
      description: "Connect with our AI chatbot through text or voice to discuss your feelings and concerns.",
    },
    {
      title: "Receive Support",
      description: "Get personalized guidance, resources, and coping strategies based on your needs.",
    },
    {
      title: "Track Your Progress",
      description: "Monitor your mood patterns and improvements over time with our tracking tools.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our intuitive platform makes it easy to get the support you need in just a few steps.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG93JTIwaXQlMjB3b3Jrc3xlbnwwfHwwfHx8MA%3D%3D"
              alt="MindfulAI Interface"
              className="object-cover"
            />
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

