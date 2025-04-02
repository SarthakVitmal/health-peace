import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4 py-12">
      <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: 01/04/2025</p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p className="text-gray-600">
              MindEase ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mental health services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
            <p className="text-gray-600">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Personal Information:</strong> Name, email, age, and contact details when you register</li>
              <li><strong>Health Information:</strong> Mood data, journal entries, and self-reported mental health status</li>
              <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
            <p className="text-gray-600">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide and personalize our mental health services</li>
              <li>Analyze usage to improve our platform</li>
              <li>Respond to your inquiries and provide support</li>
              <li>Ensure the security of our services</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3 text-gray-600 font-medium">
              We <strong>never</strong> sell your personal data or use it for advertising purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
            <p className="text-gray-600">
              We implement industry-standard security measures including encryption, access controls, and regular security audits. All health data is stored with additional protections.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
            <p className="text-gray-600">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access, correct, or delete your personal information</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Lodge a complaint with a regulatory authority</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this policy periodically. We'll notify you of significant changes through our platform or via email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Contact Us</h2>
            <p className="text-gray-600">
              For privacy-related questions or requests, please contact our Data Protection Officer at:
            </p>
            <p className="mt-2 text-gray-600">
              <strong>Email:</strong> privacy@mindease.ai<br />
              <strong>Mail:</strong> MindEase Privacy Team, Mumbai
            </p>
          </section>

          <div className="flex justify-center pt-8">
            <Button asChild className="w-full max-w-xs">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}