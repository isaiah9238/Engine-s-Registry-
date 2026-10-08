import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Send,
  FileText,
  FileCode,
  Layers,
} from 'lucide-react';
import type { SkillRecord } from '../types/skill';
import { uploadSkillToDrive } from '../services/googleDrive';
import { sendSkillViaGmail } from '../services/googleGmail';
import { ConfirmationModal } from './ConfirmationModal';

interface WorkspaceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillRecord | null;
  accessToken: string | null;
  onRequireAuth: () => void;
  defaultMode?: 'drive' | 'gmail';
  currentUserEmail?: string;
}

export const WorkspaceExportModal: React.FC<WorkspaceExportModalProps> = ({
  isOpen,
  onClose,
  skill,
  accessToken,
  onRequireAuth,
  defaultMode = 'drive',
  currentUserEmail = '',
}) => {
  const [mode, setMode] = useState<'drive' | 'gmail'>(defaultMode);
  const [driveFormat, setDriveFormat] = useState<'markdown' | 'summary_json' | 'bundle'>('markdown');
  const [recipientEmail, setRecipientEmail] = useState(currentUserEmail);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Confirmation Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!isOpen || !skill) return null;

  const handleTriggerAction = () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }
    // Open explicit confirmation modal before executing Workspace mutation
    setIsConfirmOpen(true);
  };

  const executeConfirmedAction = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      if (mode === 'drive') {
        const fileExt = driveFormat === 'markdown' ? 'SKILL.md' : driveFormat === 'summary_json' ? 'summary.json' : 'json';
        const fileRes = await uploadSkillToDrive(accessToken!, skill, driveFormat);
        setStatusMessage(`Successfully saved '${skill.name}.${fileExt}' to your Google Drive!`);
      } else {
        if (!recipientEmail || !recipientEmail.includes('@')) {
          throw new Error('Please provide a valid recipient email address.');
        }
        await sendSkillViaGmail(accessToken!, recipientEmail, skill, notes);
        setStatusMessage(`Successfully dispatched skill registration digest to ${recipientEmail} via Gmail!`);
      }
    } catch (err: any) {
      console.error('Workspace action error:', err);
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                {mode === 'drive' ? <HardDrive className="w-5 h-5 text-emerald-500" /> : <Mail className="w-5 h-5 text-sky-500" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {mode === 'drive' ? 'Export Skill to Google Drive' : 'Share Skill via Gmail'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: <span className="font-mono font-medium">{skill.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 p-1 gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('drive');
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'drive'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Google Drive</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('gmail');
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'gmail'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gmail Distribution</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-xs">
            {!accessToken && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Google Workspace Authorization Required:</span>
                  Please sign in with Google to grant access to Drive and Gmail permissions.
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200">
                {errorMessage}
              </div>
            )}

            {mode === 'drive' ? (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Select File Package Format:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDriveFormat('markdown')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        driveFormat === 'markdown'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-emerald-600 mb-1" />
                      <div className="font-bold">Raw SKILL.md</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">With frontmatter</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDriveFormat('summary_json')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        driveFormat === 'summary_json'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FileCode className="w-4 h-4 text-sky-600 mb-1" />
                      <div className="font-bold">summary.json</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ingestion contract</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDriveFormat('bundle')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        driveFormat === 'bundle'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-purple-600 mb-1" />
                      <div className="font-bold">Full Package</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">JSON bundle</div>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                  <span className="font-semibold block mb-0.5">Upload Target:</span>
                  Will upload to your personal Google Drive root folder with title:{' '}
                  <code className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {skill.name}.{driveFormat === 'markdown' ? 'SKILL.md' : driveFormat === 'summary_json' ? 'summary.json' : 'json'}
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Custom Notes / Context (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Here is the verified SKILL.md definition for review before deployment..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                  Includes rendered HTML digest, Ingestion Summary JSON, parameters table, and SKILL.md source.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleTriggerAction}
              disabled={isProcessing}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                mode === 'drive'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800'
              }`}
            >
              {isProcessing ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'drive' ? (
                <Upload className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{mode === 'drive' ? 'Export to Drive' : 'Send via Gmail'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title={mode === 'drive' ? 'Confirm Google Drive Export' : 'Confirm Gmail Transmission'}
        message={
          mode === 'drive'
            ? `Are you sure you want to write '${skill.name}.${driveFormat === 'markdown' ? 'SKILL.md' : driveFormat === 'summary_json' ? 'summary.json' : 'json'}' to your Google Drive account?`
            : `Are you sure you want to send this skill package email from your Gmail account to ${recipientEmail}?`
        }
        details={[
          `Skill: ${skill.title} (${skill.name} v${skill.version})`,
          `Target API: ${mode === 'drive' ? 'Google Drive REST API v3' : 'Gmail REST API v1'}`,
          `User Auth: ${currentUserEmail || 'Authenticated Google Account'}`,
        ]}
        confirmLabel={mode === 'drive' ? 'Confirm Upload to Drive' : 'Confirm Send via Gmail'}
        cancelLabel="Cancel"
        onConfirm={executeConfirmedAction}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isProcessing}
      />
    </>
  );
};
