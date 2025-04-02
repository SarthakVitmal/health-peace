import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQ = () => {
  const faqs = [
    {
      question: "Is my information kept private?",
      answer: "Yes, we prioritize your privacy. All conversations are anonymous by default, and we use industry-standard encryption to protect your data. You can choose what information to share with the platform.",
    },
    {
      question: "How accurate is the AI in providing mental health support?",
      answer: "Our AI is trained on extensive mental health resources and is designed to provide supportive, evidence-based guidance. However, it's important to note that it's not a replacement for professional mental health care in crisis situations.",
    },
    {
      question: "Can I use the app without creating an account?",
      answer: "Yes, you can use basic features anonymously. Creating an account allows you to access additional features like mood tracking, chat history, and personalized recommendations.",
    },
    {
      question: "Is the service available in multiple languages?",
      answer: "Currently, we support English, with plans to expand to additional languages in the near future. We're committed to making mental health support accessible to as many people as possible.",
    },
    {
      question: "What should I do in a mental health emergency?",
      answer: "If you're experiencing a mental health emergency or crisis, please contact emergency services immediately. Our platform includes emergency guidance with local crisis resources, but direct professional help is essential in urgent situations.",
    },
    {
      question: "How does the mood tracking feature work?",
      answer: "The mood tracking feature allows you to log your emotional state regularly. The system analyzes patterns over time and provides insights about your emotional wellbeing, potential triggers, and coping strategies that might be helpful.",
    },
  ]

  return (
    <section id="faq" className="py-20 flex justify-center bg-gradient-to-b from-white to-indigo-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about our mental health support platform.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline text-gray-800 hover:text-indigo-600 font-medium text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FAQ