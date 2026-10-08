import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  RefreshCw,
  Download,
  Trash2,
  FileText,
  FileCode,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  listDriveSkillFiles,
  fetchDriveFileContent,
  deleteDriveFile,
  type DriveFileItem,
} from '../services/googleDrive';
import { parseSkillMarkdown } from '../services/skillParser';
import type { SkillRecord } from '../types/skill';
import { ConfirmationModal } from './ConfirmationModal';

interface DriveBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onRequireAuth: () => void;
  onImportSkill: (skill: SkillRecord) => Promise<void>;
  currentUserEmail?: string;
}

export const DriveBrowserModal: React.FC<DriveBrowserModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  onRequireAuth,
  onImportSkill,
  currentUserEmail,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Deletion Confirmation Modal State
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadFiles();
    }
  }, [isOpen, accessToken]);

  const loadFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await listDriveSkillFiles(accessToken);
      setFiles(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list Google Drive files');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleImport = async (file: DriveFileItem) => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }
    setImportingId(file.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const content = await fetchDriveFileContent(accessToken, file.id);
      let parsedSkillRecord: SkillRecord;

      if (file.name.endsWith('.json') && content.includes('"skillRecord"')) {
        // Full bundle package
        const pkg = JSON.parse(content);
        parsedSkillRecord = pkg.skillRecord;
      } else {
        // Raw Markdown file
        const parsed = parseSkillMarkdown(content);
        const now = new Date().toISOString();
        parsedSkillRecord = {
          id: parsed.skill.name || file.name.replace(/\.[^/.]+$/, ''),
          name: parsed.skill.name || file.name.replace(/\.[^/.]+$/, ''),
          title: parsed.skill.title || file.name,
          description: parsed.skill.description || 'Imported from Google Drive',
          category: parsed.skill.category || 'workflow-automation',
          version: parsed.skill.version || '1.0.0',
          securityClearance: parsed.skill.securityClearance || 'public',
          isExecutable: parsed.skill.isExecutable ?? true,
          runtime: parsed.skill.runtime || 'in_process',
          returns: parsed.skill.returns || '{\n  "type": "object"\n}',
          sourceReferences: parsed.skill.sourceReferences || [],
          authorId: 'drive-import',
          authorEmail: currentUserEmail || 'user@drive.google.com',
          skillMarkdown: content,
          summaryJson: JSON.stringify(parsed.summaryJson, null, 2),
          parameters: parsed.skill.parameters || '[]',
          examples: parsed.skill.examples || '[]',
          references: parsed.skill.references || '[]',
          dependencies: parsed.skill.dependencies || '[]',
          codeFiles: parsed.skill.codeFiles || '{}',
          status: 'verified',
          isPublic: (parsed.skill.securityClearance || 'public') !== 'admin-only',
          createdAt: now,
          updatedAt: now,
        };
      }

      await onImportSkill(parsedSkillRecord);
      setSuccessMsg(`Successfully imported '${parsedSkillRecord.title}' into the local registry!`);
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message}`);
    } finally {
      setImportingId(null);
    }
  };

  const executeConfirmedDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setSuccessMsg(`Removed '${fileToDelete.name}' from Google Drive.`);
      setFileToDelete(null);
    } catch (err: any) {
      setErrorMsg(`Failed to delete file: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Google Drive Cloud Skill Storage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect and import skills and schemas directly from your Drive.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadFiles}
                disabled={isLoading || !accessToken}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                title="Refresh Files"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            {!accessToken ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sign in with your Google account to connect and browse files from Google Drive.
                </p>
                <button
                  onClick={onRequireAuth}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Sign in with Google
                </button>
              </div>
            ) : (
              <>
                {successMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs">
                    {errorMsg}
                  </div>
                )}

                {isLoading ? (
                  <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <span className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Querying Google Drive files...</span>
                  </div>
                ) : files.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 text-xs">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {file.name.endsWith('.md') ? (
                              <FileText className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <FileCode className="w-4 h-4 text-sky-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '—'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleImport(file)}
                            disabled={importingId === file.id}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {importingId === file.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>Import</span>
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No skill files found in Google Drive
                    </p>
                    <p>Use &ldquo;Drive Export&rdquo; on any skill in the registry to upload files here.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation modal for file deletion */}
      <ConfirmationModal
        isOpen={Boolean(fileToDelete)}
        title="Delete File from Google Drive"
        message={`Are you sure you want to permanently delete '${fileToDelete?.name}' from your Google Drive? This action cannot be undone.`}
        isDestructive={true}
        confirmLabel="Delete from Drive"
        cancelLabel="Cancel"
        onConfirm={executeConfirmedDelete}
        onCancel={() => setFileToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
};
