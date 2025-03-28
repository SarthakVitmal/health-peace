import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p>
            MindEase ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mental health services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Personal Information:</strong> Name, email, age, and contact details when you register</li>
            <li><strong>Health Information:</strong> Mood data, journal entries, and self-reported mental health status</li>
            <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Provide and personalize our mental health services</li>
            <li>Analyze usage to improve our platform</li>
            <li>Respond to your inquiries and provide support</li>
            <li>Ensure the security of our services</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-4">
            We <strong>never</strong> sell your personal data or use it for advertising purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption, access controls, and regular security audits. All health data is stored with additional protections.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Access, correct, or delete your personal information</li>
            <li>Request a copy of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Lodge a complaint with a regulatory authority</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We'll notify you of significant changes through our platform or via email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
          <p>
            For privacy-related questions or requests, please contact our Data Protection Officer at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> privacy@mindease.ai<br />
            <strong>Mail:</strong> MindEase Privacy Team, 123 Wellness Way, San Francisco, CA 94107
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