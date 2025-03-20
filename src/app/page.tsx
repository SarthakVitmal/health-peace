import type { Metadata } from "next"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Testimonials from "@/components/testimonials"
import FAQ from "@/components/faq"
import CTA from "@/components/cta"

export const metadata: Metadata = {
  title: "MindfulAI | 24/7 Mental Health Support",
  description: "AI-powered mental health support available 24/7 on web and mobile",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
    </div>
  )
}

