import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4 py-12">
      <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Effective Date: 01/04/2025</p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using MindEase ("Service"), you agree to be bound by these Terms. If you disagree with any part, you may not use our Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. Service Description</h2>
            <p className="text-gray-600">
              MindEase provides AI-assisted mental health support including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Mood tracking and analysis</li>
              <li>Therapeutic conversation tools</li>
              <li>Mental health resources</li>
              <li>Personalized recommendations</li>
            </ul>
            <p className="mt-3 text-gray-600 font-medium">
              Note: Our Service is not a substitute for professional medical care.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">3. User Responsibilities</h2>
            <p className="text-gray-600">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide accurate information</li>
              <li>Use the Service for personal, non-commercial purposes</li>
              <li>Not share login credentials</li>
              <li>Comply with all applicable laws</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. Prohibited Conduct</h2>
            <p className="text-gray-600">You may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Use the Service to harm others or yourself</li>
              <li>Reverse engineer or exploit vulnerabilities</li>
              <li>Impersonate any person or entity</li>
              <li>Violate others' privacy rights</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Intellectual Property</h2>
            <p className="text-gray-600">
              All content, features, and functionality are owned by MindEase and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Disclaimers</h2>
            <p className="text-gray-600 font-medium">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Continuous, uninterrupted access</li>
              <li>Accuracy of AI-generated content</li>
              <li>Results from using our tools</li>
            </ul>
            <p className="mt-3 text-gray-600 font-medium">
              Medical Disclaimer: Our Service does not provide medical diagnosis or treatment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Limitation of Liability</h2>
            <p className="text-gray-600">
              MindEase shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">8. Termination</h2>
            <p className="text-gray-600">
              We may suspend or terminate your access for violation of these Terms. You may delete your account at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">9. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">10. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by the laws of India without regard to conflict of law principles.
            </p>
          </section>

          <div className="flex justify-center pt-8">
            <Button asChild className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-600">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}