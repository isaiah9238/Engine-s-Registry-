import React from 'react';
import { FileText, ArrowLeft, Scale, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Skill Registry</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Scale className="w-3.5 h-3.5" />
            <span>Platform Service Agreement</span>
          </div>
        </div>

        {/* Document Header */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/70 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-semibold block">
                Operational Legal Agreement
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Terms of Service
              </h1>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Effective Date:</span>
              <strong className="text-slate-800 dark:text-slate-200">October 4, 2026</strong>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Application Identifier:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                Agent Engine &amp; Skill Registry (isaiahsanddavesapp.ai.studio)
              </strong>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">1.</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing or using the Agent Engine application and its associated APIs (&ldquo;Services&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not authenticate or utilize the Services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">2.</span>
              <span>Use of Services</span>
            </h2>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Developer Responsibilities:</strong> You are responsible for any skill definitions, prompt directives, code schemas, or executable instructions authored or deployed under your authenticated account.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Acceptable Use:</strong> You agree not to use the Services to distribute malicious code, execute unauthorized penetration testing against unowned third-party infrastructure, disrupt database integrity, or circumvent role-based access restrictions.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Security Boundaries:</strong> Attempting to bypass security clearance filters, impersonate administrative privileges, or spoof device integrity tokens is strictly prohibited.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">3.</span>
              <span>Intellectual Property and Content</span>
            </h2>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">User Content:</strong> You retain ownership of the custom workflows, markdown directives, and logic you author and register.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Platform License:</strong> By publishing skills marked with public clearance or visibility, you grant the platform the necessary license to store, parse, index, and display those directives to other users of the registry.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">4.</span>
              <span>Disclaimer of Warranties</span>
            </h2>
            <p>
              The Services are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. The platform does not guarantee continuous uptime, error-free execution of agentic routines, or deterministic outcomes from external AI model endpoints.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">5.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p>
              To the maximum extent permitted by applicable law, the operators of the Agent Engine shall not be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of, or inability to use, the platform or its connected cloud tools.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">6.</span>
              <span>Account Suspension and Modification</span>
            </h2>
            <p>
              We reserve the right to modify platform schemas, update API specifications, or suspend access for accounts that violate these terms or compromise system availability.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">7.</span>
              <span>Governing Law</span>
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, United States, without regard to conflict of law principles.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">8.</span>
              <span>Contact Information</span>
            </h2>
            <p>For questions or concerns regarding these Terms:</p>
            <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs font-mono text-indigo-700 dark:text-indigo-300">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Email: </span>
              <a
                href="mailto:isaiah9238@gmail.com"
                className="font-bold underline hover:text-indigo-900 dark:hover:text-indigo-100"
              >
                isaiah9238@gmail.com
              </a>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4">
          <span>&copy; 2026 Agent Engine &amp; Skill Registry</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </a>
            <button onClick={handleBack} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
