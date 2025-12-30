import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <h1 className="text-5xl font-black mb-8 uppercase tracking-tighter">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last Updated: December 30, 2025</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Introduction</h2>
            <p>
              Welcome to SynergyMind. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address and authentication credentials when you sign in with Google.</li>
              <li><strong>Audio Recordings:</strong> Voice recordings you create using our service for analysis and transcription.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our service, including session history and timestamps.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process your audio recordings and generate insights</li>
              <li>Authenticate your account and manage your sessions</li>
              <li>Improve our service and develop new features</li>
              <li>Communicate with you about service updates</li>
              <li>Process payments and manage your credit balance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Data Storage and Security</h2>
            <p className="mb-4">
              We take data security seriously. Your audio recordings and analysis results are stored securely using industry-standard encryption.
              We use Supabase for secure database storage and Google's Gemini AI for audio processing.
            </p>
            <p>
              Your local browser also stores certain data locally, including draft sessions and preferences. This local data never leaves your device
              unless you explicitly save a session to the cloud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Sign-In:</strong> For authentication</li>
              <li><strong>Google Gemini AI:</strong> For audio transcription and analysis</li>
              <li><strong>Supabase:</strong> For secure data storage</li>
              <li><strong>Stripe:</strong> For payment processing (when purchasing credits)</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">6. Data Retention</h2>
            <p>
              We retain your account information and saved sessions for as long as your account is active.
              You can delete individual sessions or your entire account at any time. Upon account deletion,
              all associated data will be permanently removed from our servers within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data and account</li>
              <li>Export your data</li>
              <li>Object to data processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">8. Children's Privacy</h2>
            <p>
              SynergyMind is not intended for users under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected information
              from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">10. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="mt-4 text-cyan-400 font-bold">
              privacy@synergymind.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
