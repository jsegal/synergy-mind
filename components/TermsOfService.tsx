import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
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

        <h1 className="text-5xl font-black mb-8 uppercase tracking-tighter">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last Updated: December 30, 2025</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SynergyMind, you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Description of Service</h2>
            <p>
              SynergyMind is an AI-powered audio recording and analysis platform that provides transcription,
              insights, and strategic recommendations based on your voice recordings. The service uses advanced
              artificial intelligence to analyze your content and generate personalized guidance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Account Registration</h2>
            <p className="mb-4">To use SynergyMind, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account using Google Sign-In</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 13 years of age</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-4">
              You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Credits and Payments</h2>
            <p className="mb-4">
              SynergyMind operates on a credit-based system:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>New users receive 3,000 free credits upon registration</li>
              <li>Each recording session costs 500 credits</li>
              <li>Additional credits can be purchased at $15.00 for 3,000 credits</li>
              <li>Credits do not expire</li>
              <li>Credits are non-refundable once purchased</li>
              <li>Payment processing is handled securely through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Acceptable Use</h2>
            <p className="mb-4">When using SynergyMind, you agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Record conversations without consent of all participants</li>
              <li>Upload content that is illegal, harmful, or violates others' rights</li>
              <li>Use the service to harass, abuse, or harm others</li>
              <li>Attempt to reverse engineer or copy our technology</li>
              <li>Share your account credentials with others</li>
              <li>Use automated tools to access the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">6. Content Ownership and Rights</h2>
            <p className="mb-4">
              You retain all rights to your audio recordings and the content you create. By using SynergyMind,
              you grant us a limited license to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Store and process your recordings</li>
              <li>Use AI services to analyze your content</li>
              <li>Generate transcripts and insights</li>
              <li>Improve our service quality</li>
            </ul>
            <p className="mt-4">
              We do not claim ownership of your content and will not share it with third parties except as
              necessary to provide the service or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">7. AI-Generated Content</h2>
            <p>
              SynergyMind uses artificial intelligence to generate insights and recommendations. While we strive
              for accuracy, AI-generated content may contain errors or inaccuracies. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>AI insights are suggestions, not professional advice</li>
              <li>You are responsible for evaluating and acting on AI recommendations</li>
              <li>SynergyMind is not liable for decisions made based on AI-generated content</li>
              <li>The service does not replace professional consultation when needed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">8. Service Availability</h2>
            <p>
              We strive to maintain high service availability but do not guarantee uninterrupted access.
              We may modify, suspend, or discontinue any aspect of the service at any time. We are not
              liable for any service interruptions or data loss.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">9. Disclaimer of Warranties</h2>
            <p>
              SynergyMind is provided "as is" without warranties of any kind, either express or implied.
              We do not warrant that the service will be error-free, secure, or always available. You use
              the service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SynergyMind and its affiliates shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages arising from your
              use of the service. Our total liability shall not exceed the amount you paid for the service
              in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">11. Termination</h2>
            <p className="mb-4">
              Either party may terminate this agreement at any time:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may close your account at any time</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
              <li>Upon termination, your access will cease immediately</li>
              <li>Purchased credits are non-refundable upon termination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">12. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the service after changes constitutes
              acceptance of the new terms. Material changes will be communicated via email or service notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">13. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which SynergyMind operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">14. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-4 text-cyan-400 font-bold">
              support@synergymind.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
