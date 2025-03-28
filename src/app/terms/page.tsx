import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MindEase ("Service"), you agree to be bound by these Terms. If you disagree with any part, you may not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
          <p>
            MindEase provides AI-assisted mental health support including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Mood tracking and analysis</li>
            <li>Therapeutic conversation tools</li>
            <li>Mental health resources</li>
            <li>Personalized recommendations</li>
          </ul>
          <p className="mt-4">
            <strong>Note:</strong> Our Service is not a substitute for professional medical care.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Provide accurate information</li>
            <li>Use the Service for personal, non-commercial purposes</li>
            <li>Not share login credentials</li>
            <li>Comply with all applicable laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Prohibited Conduct</h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Use the Service to harm others or yourself</li>
            <li>Reverse engineer or exploit vulnerabilities</li>
            <li>Impersonate any person or entity</li>
            <li>Violate others' privacy rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            All content, features, and functionality are owned by MindEase and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Continuous, uninterrupted access</li>
            <li>Accuracy of AI-generated content</li>
            <li>Results from using our tools</li>
          </ul>
          <p className="mt-4">
            <strong>Medical Disclaimer:</strong> Our Service does not provide medical diagnosis or treatment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            MindEase shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
          <p>
            We may suspend or terminate your access for violation of these Terms. You may delete your account at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of [Your State/Country] without regard to conflict of law principles.
          </p>
        </section>

        <div className="flex justify-center mt-12">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}