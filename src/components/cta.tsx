import { Button } from "@/components/ui/button"

const CTA = () => {
  return (
    <section className="py-20 bg-indigo-900 text-primary-foreground flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Start Your Mental Health Journey Today
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who have found support, guidance, and peace of mind with our AI-powered mental
              health platform.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <a href="/signup" className="px-8 py-2 border-1 border-white rounded-md items-center flex justify-center">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA

