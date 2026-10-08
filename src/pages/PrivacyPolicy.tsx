import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Database, KeyRound, Mail, ExternalLink } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Compliance Document</span>
          </div>
        </div>

        {/* Document Header */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/70 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-semibold block">
                Legal &amp; Data Governance
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Privacy Policy
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
              <span>Overview</span>
            </h2>
            <p>
              This Privacy Policy outlines how the Agent Engine platform (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Application&rdquo;) collects, processes, and protects your information when you access or interact with our registry and developer services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">2.</span>
              <span>Information We Collect</span>
            </h2>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Account Information:</strong> When you authenticate using Google Sign-In, we receive basic authentication profile data, including your Google account email address, display name, and unique user identifier (uid).
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Operational &amp; Registry Data:</strong> We store skill definitions, architectural metadata, markdown documentation, code snippets, execution telemetry, and security access tiers submitted directly by users.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Security &amp; Device Signals:</strong> Through integrations such as reCAPTCHA and Firebase App Check, the Application evaluates client device integrity, network identifiers, and interaction tokens to prevent automated fraud and bot abuse.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Workspace Scopes (If Enabled):</strong> If authorized by the user, the Application interacts with Google Drive or Gmail solely to facilitate user-directed tasks, such as skill archive synchronization and digest distribution.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">3.</span>
              <span>How Information Is Used</span>
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To authenticate user identities and evaluate Attribute-Based Access Control (ABAC) permissions.</li>
              <li>To persist, index, and query procedural skills, prompt templates, and execution schemas.</li>
              <li>To verify API request authenticity and prevent brute-force or malicious exploitation.</li>
              <li>We do not sell, rent, or trade your personal data to third parties.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">4.</span>
              <span>Data Storage and Security</span>
            </h2>
            <p>
              All persistent records are managed using Google Cloud Firestore and associated Firebase infrastructure with strict access control policies. Document mutations, administrative operations, and clearance tiers are guarded by database-level security rules.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">5.</span>
              <span>Third-Party Services</span>
            </h2>
            <p>The Application relies on trusted enterprise cloud platforms to provide infrastructure and security:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Google Cloud / Firebase</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Identity authentication, Firestore database hosting, and infrastructure monitoring.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Google reCAPTCHA &amp; App Check</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automated risk scoring, client origin attestation, and bot fraud mitigation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">6.</span>
              <span>User Rights &amp; Data Deletion</span>
            </h2>
            <p>
              Users may inspect their public profile data and authored registry documents at any time. To request deletion of account records or stored registry entries, contact the administrator at the email address provided below.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">7.</span>
              <span>Contact Information</span>
            </h2>
            <p>For inquiries regarding this Privacy Policy or platform data practices:</p>
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
            <a href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service
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
