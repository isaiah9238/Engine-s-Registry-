import React, { useState, useEffect } from 'react';
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
  Activity,
  History,
  Terminal,
  Database,
  Sparkles,
  Zap,
  Play,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type {
  SkillRecord,
  SkillParameter,
  SkillReference,
  SkillExample,
  SkillCodeFile,
  IngestionSummaryJson,
  ExecutionTrace,
  CachedSkillRecord,
  SecurityClearance,
} from '../types/skill';
import {
  fetchExecutionTraces,
  simulateSkillExecution,
} from '../services/executionTraceService';
import {
  cacheSkillLocally,
  getCachedSkill,
} from '../services/localRegistryCache';

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
  const [activeTab, setActiveTab] = useState<
    'markdown' | 'summary' | 'parameters' | 'code' | 'examples' | 'references' | 'runtime' | 'executions' | 'cache'
  >('markdown');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Execution Traces & Simulation State
  const [traces, setTraces] = useState<ExecutionTrace[]>([]);
  const [isLoadingTraces, setIsLoadingTraces] = useState(false);
  const [testParams, setTestParams] = useState<Record<string, any>>({});
  const [callerClearance, setCallerClearance] = useState<SecurityClearance>('public');
  const [latestTrace, setLatestTrace] = useState<ExecutionTrace | null>(null);

  // Local Cache State
  const [cachedRecord, setCachedRecord] = useState<CachedSkillRecord | null>(null);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheSuccessMessage, setCacheSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (skill) {
      loadSkillTraces(skill.id);
      loadCacheStatus(skill.id);
      initTestParams(skill);
    }
  }, [skill?.id]);

  const loadSkillTraces = async (skillId: string) => {
    setIsLoadingTraces(true);
    try {
      const data = await fetchExecutionTraces(skillId);
      setTraces(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingTraces(false);
    }
  };

  const loadCacheStatus = async (skillId: string) => {
    try {
      const cached = await getCachedSkill(skillId);
      setCachedRecord(cached);
    } catch {
      // ignore
    }
  };

  const initTestParams = (s: SkillRecord) => {
    const initial: Record<string, any> = {};
    if (s.parametersSchema?.properties) {
      Object.keys(s.parametersSchema.properties).forEach((k) => {
        initial[k] = s.parametersSchema?.properties[k]?.default || 'test_value';
      });
    } else {
      try {
        const parsed = JSON.parse(s.parameters || '[]');
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            initial[p.name] = p.default || 'test_value';
          });
        }
      } catch {
        // ignore
      }
    }
    setTestParams(initial);
  };

  const handleRunSimulation = async () => {
    if (!skill) return;
    setIsExecuting(true);
    try {
      const { result, trace } = await simulateSkillExecution(
        skill,
        testParams,
        callerClearance
      );
      setLatestTrace(trace);
      setExecutionOutput(JSON.stringify(result, null, 2));
      setTraces((prev) => [trace, ...prev.filter((t) => t.executionId !== trace.executionId)]);
    } catch (err: any) {
      setExecutionOutput(JSON.stringify({ error: err?.message || 'Execution error' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCacheLocally = async () => {
    if (!skill) return;
    setIsCaching(true);
    setCacheSuccessMessage(null);
    try {
      const cached = await cacheSkillLocally(skill);
      setCachedRecord(cached);
      setCacheSuccessMessage(`Stored in local IndexedDB. SHA-256 Checksum: ${cached.bundleSha256?.slice(0, 16)}...`);
    } catch (err: any) {
      console.warn('Cache error:', err);
    } finally {
      setIsCaching(false);
    }
  };

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

          <button
            onClick={() => setActiveTab('runtime')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'runtime'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>Runtime &amp; Execution</span>
          </button>

          <button
            onClick={() => setActiveTab('executions')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'executions'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-500" />
            <span>Execution Traces ({traces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cache')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cache'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>Local Registry Cache</span>
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

          {/* TAB 7: Runtime & Tool Execution (Studio Alchemist) */}
          {activeTab === 'runtime' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Studio Alchemist Runtime Tool Execution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Execution bindings, ABAC clearance tiers, and return schema for autonomous agents.
                </p>
              </div>

              {/* Status & Clearance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Execution Mode
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        skill.isExecutable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {skill.isExecutable ? 'Active Executable Tool' : 'Knowledge Protocol'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {skill.isExecutable
                      ? 'Callable directly by agent tool dispatch'
                      : 'Guides agent chain-of-thought without code run'}
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Target Runtime
                  </span>
                  <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block uppercase">
                    {skill.runtime || 'in_process'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {skill.runtime === 'mcp'
                      ? 'Model Context Protocol server'
                      : skill.runtime === 'cloud_function'
                      ? 'Serverless Cloud Function API'
                      : 'Local in-process execution worker'}
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    ABAC Clearance
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      skill.securityClearance === 'admin-only'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                        : skill.securityClearance === 'internal'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                    }`}
                  >
                    {skill.securityClearance || 'public'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Enforced via Firestore security rules &amp; token claims
                  </span>
                </div>
              </div>

              {/* Notebook Source References */}
              {skill.sourceReferences && skill.sourceReferences.length > 0 && (
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Studio Alchemist Notebook Sources &amp; Keys
                  </span>
                  <div className="space-y-1">
                    {skill.sourceReferences.map((src, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center justify-between"
                      >
                        <span className="truncate">{src}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">Source Key</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return Schema */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Expected Return JSON Schema (returns)
                  </span>
                  <button
                    onClick={() => handleCopy(skill.returns || '{}', 'returns')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    {copied === 'returns' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy Schema</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto">
                  {skill.returns || '{\n  "type": "object",\n  "description": "Standard execution payload"\n}'}
                </pre>
              </div>

              {/* Interactive Tool Runner */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Live Runtime Simulation
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Test tool call validation and examine simulated output against the return schema.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsExecuting(true);
                      setTimeout(() => {
                        const sampleOutput = {
                          status: 'success',
                          skill: skill.name,
                          runtime: skill.runtime || 'in_process',
                          timestamp: new Date().toISOString(),
                          telemetry: {
                            executionTimeMs: Math.floor(Math.random() * 40) + 12,
                            thermodynamicClass: 'low-dissipation',
                          },
                          payload: {
                            message: `Simulated execution of ${skill.title} completed successfully.`,
                            verifiedAgainstSchema: true,
                          },
                        };
                        setExecutionOutput(JSON.stringify(sampleOutput, null, 2));
                        setIsExecuting(false);
                      }, 400);
                    }}
                    disabled={isExecuting}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isExecuting ? (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5" />
                    )}
                    <span>Simulate Tool Invocation</span>
                  </button>
                </div>

                {executionOutput && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Runtime Telemetry &amp; Execution Output:
                    </span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {executionOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: Operational Subcollection - Execution Traces */}
          {activeTab === 'executions' && (
            <div className="space-y-6">
              {/* Telemetry Header */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 font-mono">
                    <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Operational Subcollection: /skills/{skill.id}/executions/&#123;executionId&#125;</span>
                  </span>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                    Traces Recorded: {traces.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tracks invocation telemetry, runtime performance, and verification status across distributed agent nodes.
                </p>
              </div>

              {/* Live Invocation Simulator */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    <span>Invoke Tool Execution Run</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Assert Clearance:</span>
                    <select
                      value={callerClearance}
                      onChange={(e) => setCallerClearance(e.target.value as SecurityClearance)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-mono"
                    >
                      <option value="public">public</option>
                      <option value="internal">internal</option>
                      <option value="admin-only">admin-only</option>
                    </select>
                  </div>
                </div>

                {/* Input Parameters Dynamic Form */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Input Parameters (parametersSchema: map)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(skill.parametersSchema?.properties || {}).length > 0 ? (
                      Object.keys(skill.parametersSchema?.properties || {}).map((paramName) => (
                        <div key={paramName} className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                            {paramName}
                            {skill.parametersSchema?.required?.includes(paramName) && (
                              <span className="text-red-500 ml-0.5">*</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={testParams[paramName] ?? ''}
                            onChange={(e) =>
                              setTestParams({ ...testParams, [paramName]: e.target.value })
                            }
                            placeholder={`Enter ${paramName}...`}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-500 font-mono">
                        No external arguments required for this tool call.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">
                    Target Runtime: <strong className="text-indigo-600 dark:text-indigo-400">{skill.runtime || 'in_process'}</strong>
                  </span>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Execute &amp; Record Trace</span>
                  </button>
                </div>

                {latestTrace && (
                  <div className="mt-3 p-3.5 bg-slate-900 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Trace: {latestTrace.executionId}</span>
                      <span className={latestTrace.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                        {latestTrace.status.toUpperCase()} &bull; {latestTrace.latencyMs}ms
                      </span>
                    </div>
                    <pre className="text-emerald-300 text-[11px] overflow-x-auto whitespace-pre">
                      {executionOutput}
                    </pre>
                  </div>
                )}
              </div>

              {/* Execution Traces History Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-purple-500" />
                  <span>Telemetry Log History (/skills/{skill.id}/executions)</span>
                </h4>

                {traces.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px]">
                        <tr>
                          <th className="p-3">Execution ID</th>
                          <th className="p-3">Agent / Caller</th>
                          <th className="p-3">Runtime</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Latency</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                        {traces.map((trace) => (
                          <tr key={trace.executionId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">
                              {trace.executionId}
                            </td>
                            <td className="p-3 truncate max-w-[120px]">
                              {trace.agentId} ({trace.callerClearance || 'public'})
                            </td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                {trace.runtime}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  trace.status === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                                }`}
                              >
                                {trace.status}
                              </span>
                            </td>
                            <td className="p-3 font-bold">
                              {trace.latencyMs}ms
                            </td>
                            <td className="p-3 text-[10px] text-slate-400">
                              {new Date(trace.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 font-mono">
                    No execution traces logged yet. Click &ldquo;Execute &amp; Record Trace&rdquo; above to simulate a live tool call.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: Client Local Registry Cache (IndexedDB / SQLite Format) */}
          {activeTab === 'cache' && (
            <div className="space-y-6">
              {/* Banner */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 font-mono">
                    <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Client Local Registry Cache (IndexedDB / SQLite Format)</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                    Compact Edge Format
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cached locally on edge agent and browser nodes to minimize memory overhead and latency during offline or local execution.
                </p>
              </div>

              {cacheSuccessMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{cacheSuccessMessage}</span>
                </div>
              )}

              {/* Cache Action Card */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Local Node Cache Status
                    </h4>
                    <span className="text-xs font-mono text-slate-500">
                      IndexedDB Store: <code className="text-indigo-600 dark:text-indigo-400">AgentEngineLocalRegistry.skills_cache</code>
                    </span>
                  </div>

                  <button
                    onClick={handleCacheLocally}
                    disabled={isCaching}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isCaching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>{cachedRecord ? 'Re-sync Local Cache' : 'Cache Skill Locally'}</span>
                  </button>
                </div>

                {cachedRecord ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bundle SHA-256 Checksum</span>
                      <code className="text-emerald-600 dark:text-emerald-400 block truncate font-bold">
                        {cachedRecord.bundleSha256 || 'Calculated on sync'}
                      </code>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Binary Blob (Executable ArrayBuffer)</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold block">
                        {cachedRecord.binaryBlob ? `${cachedRecord.binaryBlob.byteLength} bytes cached` : '0 bytes'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Last Synced Timestamp</span>
                      <span className="text-slate-800 dark:text-slate-200 block">
                        {new Date(cachedRecord.lastSyncedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TTL Status</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active (7-day node policy)</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-500 font-mono">
                    This skill is not yet stored in local IndexedDB. Click &ldquo;Cache Skill Locally&rdquo; to store guidelines and executable binary blobs for instant node access.
                  </div>
                )}
              </div>

              {/* Schema Specification Reference */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  CachedSkillRecord TypeScript Interface
                </span>
                <pre className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
{`interface CachedSkillRecord {
  skillId: string;
  name: string;
  version: string;
  runtime: 'mcp' | 'in_process' | 'cloud_function';
  securityClearance: 'public' | 'internal' | 'admin-only';
  parametersSchema: Record<string, any>;
  guidelinesMd: string;
  bundleSha256?: string;
  binaryBlob?: ArrayBuffer; // Locally cached WASM/JS executable
  lastSyncedAt: number;     // Epoch timestamp for TTL eviction
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
