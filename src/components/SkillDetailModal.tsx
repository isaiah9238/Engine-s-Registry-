import React, { useState } from 'react';
import {
  X,
  FileText,
  Code2,
  Sliders,
  BookmarkCheck,
  BookOpen,
  Copy,
  Check,
  Download,
  HardDrive,
  Mail,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import type {
  SkillRecord,
  SkillParameter,
  SkillReference,
  SkillExample,
  SkillCodeFile,
  IngestionSummaryJson,
} from '../types/skill';

interface SkillDetailModalProps {
  skill: SkillRecord | null;
  onClose: () => void;
  onEdit: (skill: SkillRecord) => void;
  onExportDrive: (skill: SkillRecord) => void;
  onShareGmail: (skill: SkillRecord) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  onClose,
  onEdit,
  onExportDrive,
  onShareGmail,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'summary' | 'parameters' | 'code' | 'examples' | 'references'>('markdown');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!skill) return null;

  let parameters: SkillParameter[] = [];
  let references: SkillReference[] = [];
  let examples: SkillExample[] = [];
  let codeFiles: Record<string, SkillCodeFile> = {};
  let dependencies: string[] = [];
  let summaryJsonObj: IngestionSummaryJson | null = null;

  try {
    if (skill.parameters) parameters = JSON.parse(skill.parameters);
    if (skill.references) references = JSON.parse(skill.references);
    if (skill.examples) examples = JSON.parse(skill.examples);
    if (skill.codeFiles) codeFiles = JSON.parse(skill.codeFiles);
    if (skill.dependencies) dependencies = JSON.parse(skill.dependencies);
    if (skill.summaryJson) summaryJsonObj = JSON.parse(skill.summaryJson);
  } catch (e) {
    console.error('Failed to parse skill properties', e);
  }

  const fileNames = Object.keys(codeFiles);
  const currentFile = selectedFile && codeFiles[selectedFile] ? codeFiles[selectedFile] : fileNames.length > 0 ? codeFiles[fileNames[0]] : null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([skill.skillMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name}.SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSummary = () => {
    const blob = new Blob([skill.summaryJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name}.summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {skill.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">v{skill.version}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {skill.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {skill.title}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Registration Identifier: <code className="text-indigo-600 dark:text-indigo-400 font-bold">{skill.name}</code>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => onExportDrive(skill)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Export bundle to Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive Export</span>
            </button>

            <button
              onClick={() => onShareGmail(skill)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Share via Gmail"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail Share</span>
            </button>

            <button
              onClick={() => onEdit(skill)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Edit skill logic"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'markdown'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SKILL.md Specification</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Ingestion Summary JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('parameters')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'parameters'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Parameters ({parameters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Scaffolded Code ({fileNames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'examples'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Examples ({examples.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'references'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>References ({references.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {/* TAB 1: Markdown Reader */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Full raw / rendered markdown view with frontmatter
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(skill.skillMarkdown, 'md')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'md' ? 'Copied' : 'Copy SKILL.md'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-indigo-500/20">
                {skill.skillMarkdown}
              </pre>
            </div>
          )}

          {/* TAB 2: Summary JSON */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Ingestion Pipeline Contract (JSON-Schema format)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Validated for Parser Ingestion
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(skill.summaryJson, 'summary')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'summary' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSummary}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {summaryJsonObj && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Thermodynamic Footprint</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                      {summaryJsonObj.evaluationRubric?.thermodynamicFootprint || 'low'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Priority Weight</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                      Level {summaryJsonObj.evaluationRubric?.priority || 1}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Required Scopes</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                      {summaryJsonObj.dependencies?.oauthScopes?.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              )}

              <pre className="p-5 bg-slate-900 text-sky-300 border border-slate-800 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {skill.summaryJson}
              </pre>
            </div>
          )}

          {/* TAB 3: Parameters */}
          {activeTab === 'parameters' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Invocation Parameters &amp; Schema Types
              </h3>
              {parameters.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Allowed / Enum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {param.name}
                          </td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                            <code>{param.type}</code>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                param.required
                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {param.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                            {param.description}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            {param.enum ? param.enum.join(' | ') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  No declared parameters for this skill.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Code Files */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Scaffolded Code &amp; Implementation Assets
                </h3>
              </div>

              {fileNames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* File List */}
                  <div className="space-y-1 md:col-span-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-1 block uppercase tracking-wider">
                      Files ({fileNames.length})
                    </span>
                    {fileNames.map((fn) => (
                      <button
                        key={fn}
                        onClick={() => setSelectedFile(fn)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                          currentFile?.filename === fn
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{fn}</span>
                        <Code2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>

                  {/* Code Viewer */}
                  <div className="md:col-span-3 space-y-2">
                    {currentFile && (
                      <div>
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {currentFile.filename} ({currentFile.language})
                          </span>
                          <button
                            onClick={() => handleCopy(currentFile.content, currentFile.filename)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            {copied === currentFile.filename ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[450px]">
                          {currentFile.content}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  No dedicated code scaffolding files attached.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Examples */}
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                In-Context Walkthroughs &amp; Test Prompts
              </h3>
              {examples.length > 0 ? (
                <div className="space-y-4">
                  {examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
                    >
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {ex.title}
                      </h4>
                      {ex.scenario && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Context: {ex.scenario}
                        </p>
                      )}
                      <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200">
                        <span className="text-indigo-500 font-semibold block mb-0.5">Prompt:</span>
                        {ex.prompt}
                      </div>
                      {ex.expectedOutcome && (
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                          <span className="font-semibold block mb-0.5">Expected Outcome:</span>
                          {ex.expectedOutcome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  No verified examples recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: References */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Foundational Research &amp; Specifications
              </h3>
              {references.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {ref.type}
                          </span>
                          {ref.url && (
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {ref.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {ref.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  No reference links added.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
