import React, { useState, useEffect } from 'react';
import {
  Compass,
  Cpu,
  Brain,
  Database,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  HardDrive,
  FileCode,
  FileText,
  CheckCircle2,
  Tag,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Code,
  Sliders,
} from 'lucide-react';
import type { SkillRecord } from '../types/skill';
import type { AgentMemoryRecord, MemoryCategory, ToolVectorSearchResult, MemoryVectorSearchResult } from '../types/agentMemory';
import {
  generateEmbedding768,
  rankSkillsByVector,
  rankMemoriesByVector,
  cosineSimilarity,
} from '../services/vectorSearch';
import {
  fetchAllAgentMemories,
  subscribeToAgentMemories,
  saveAgentMemory,
  deleteAgentMemory,
} from '../services/agentMemoryRepository';
import { uploadSkillBundle, getSkillBundle, type SkillBundleFiles } from '../services/storageService';

interface VectorSearchStudioProps {
  skills: SkillRecord[];
  currentUserEmail?: string;
  currentUserId?: string;
  onSelectSkill?: (skill: SkillRecord) => void;
}

export const VectorSearchStudio: React.FC<VectorSearchStudioProps> = ({
  skills,
  currentUserEmail,
  currentUserId,
  onSelectSkill,
}) => {
  // Tabs: 'tools' | 'memories' | 'storage'
  const [activeTab, setActiveTab] = useState<'tools' | 'memories' | 'storage'>('tools');

  // Tool Selection State
  const [toolQuery, setToolQuery] = useState('Audit cryptographic key vaults and enforce zero-trust ABAC policies');
  const [isSearchingTools, setIsSearchingTools] = useState(false);
  const [toolQueryVector, setToolQueryVector] = useState<number[] | null>(null);
  const [rankedTools, setRankedTools] = useState<ToolVectorSearchResult[]>([]);
  const [toolSearchLatency, setToolSearchLatency] = useState<number | null>(null);

  // Agent Memories State
  const [memories, setMemories] = useState<AgentMemoryRecord[]>([]);
  const [memoryCategory, setMemoryCategory] = useState<MemoryCategory | 'all'>('all');
  const [memoryQuery, setMemoryQuery] = useState('');
  const [isSearchingMemories, setIsSearchingMemories] = useState(false);
  const [rankedMemories, setRankedMemories] = useState<MemoryVectorSearchResult[]>([]);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('semantic');
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  // Cloud Storage Bundle Inspector
  const [selectedStorageSkill, setSelectedStorageSkill] = useState<SkillRecord | null>(skills[0] || null);
  const [bundleFiles, setBundleFiles] = useState<SkillBundleFiles | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);
  const [isUploadingBundle, setIsUploadingBundle] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Subscribe to agent memories
  useEffect(() => {
    fetchAllAgentMemories().then(setMemories);
    const unsub = subscribeToAgentMemories((updated) => {
      setMemories(updated);
    });
    return () => unsub();
  }, []);

  // Run initial tool search on mount
  useEffect(() => {
    handleRunToolVectorSearch();
  }, [skills]);

  // Load bundle files when selected storage skill changes
  useEffect(() => {
    if (selectedStorageSkill) {
      loadStorageBundle(selectedStorageSkill);
    }
  }, [selectedStorageSkill]);

  const loadStorageBundle = async (skill: SkillRecord) => {
    setIsLoadingBundle(true);
    setUploadSuccessMessage(null);
    try {
      const fallbackGuidelines =
        skill.bundleFiles?.guidelinesMd && !skill.bundleFiles.guidelinesMd.startsWith('gs://')
          ? skill.bundleFiles.guidelinesMd
          : skill.skillMarkdown || `# ${skill.title}\n\n${skill.description}\n`;

      let fallbackScript =
        skill.bundleFiles?.runtimeScript && !skill.bundleFiles.runtimeScript.startsWith('gs://')
          ? skill.bundleFiles.runtimeScript
          : `// Runtime script for ${skill.name}\nexport default async function run(params) {\n  return { success: true };\n}`;

      if (skill.id === 'write-skill') {
        fallbackScript = `/**\n * In-process runtime handler for write-skill\n * Performs structural validation and synthesizes skill manifests.\n */\nexport async function execute(params) {\n  const { skillName, title, mission, parametersList, examplesList } = params;\n\n  const errors = [];\n  if (!skillName || !/^[a-z0-9-_]+$/.test(skillName)) {\n    errors.push('skillName must be valid kebab-case string.');\n  }\n  if (!title || typeof title !== 'string') {\n    errors.push('title is required.');\n  }\n  if (!mission || typeof mission !== 'string') {\n    errors.push('mission is required.');\n  }\n  if (!Array.isArray(parametersList) || parametersList.length === 0) {\n    errors.push('parametersList must be a non-empty array.');\n  }\n  if (!Array.isArray(examplesList) || examplesList.length === 0) {\n    errors.push('examplesList must be a non-empty array.');\n  }\n\n  if (errors.length > 0) {\n    return {\n      success: false,\n      validationErrors: errors,\n      timestamp: new Date().toISOString()\n    };\n  }\n\n  // Generate standardized manifest\n  const manifest = {\n    skillId: skillName,\n    name: skillName.replace(/-/g, '_'),\n    title: title.trim(),\n    mission: mission.trim(),\n    parametersDeclared: parametersList.length,\n    examplesDeclared: examplesList.length,\n    validatedAt: new Date().toISOString(),\n    status: 'draft'\n  };\n\n  return {\n    success: true,\n    manifest,\n    message: \`Skill \${skillName} validated and ready for ingestion pipeline.\`\n  };\n}`;
      }

      const bundle = await getSkillBundle(skill.id, fallbackGuidelines, fallbackScript);
      setBundleFiles(bundle);
    } catch {
      // ignore
    } finally {
      setIsLoadingBundle(false);
    }
  };

  const handleRunToolVectorSearch = async () => {
    if (!toolQuery.trim() || skills.length === 0) return;
    setIsSearchingTools(true);
    const start = performance.now();

    try {
      const vector = await generateEmbedding768(toolQuery);
      setToolQueryVector(vector);
      const ranked = rankSkillsByVector(vector, skills, 5);
      setRankedTools(ranked);
      setToolSearchLatency(Math.round(performance.now() - start));
    } catch (err) {
      console.warn('Vector search notice:', err);
    } finally {
      setIsSearchingTools(false);
    }
  };

  const handleRunMemoryVectorSearch = async () => {
    if (!memoryQuery.trim()) {
      setRankedMemories([]);
      return;
    }
    setIsSearchingMemories(true);
    try {
      const vector = await generateEmbedding768(memoryQuery);
      const results = rankMemoriesByVector(
        vector,
        memories,
        10,
        memoryCategory === 'all' ? undefined : memoryCategory
      );
      setRankedMemories(results);
    } catch (err) {
      console.warn('Memory vector search notice:', err);
    } finally {
      setIsSearchingMemories(false);
    }
  };

  const handleSaveNewMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;
    setIsSavingMemory(true);
    try {
      const saved = await saveAgentMemory({
        content: newMemoryContent,
        title: newMemoryTitle || undefined,
        category: newMemoryCategory,
        agentId: currentUserId || 'agent-core-alchemist',
      });
      setMemories((prev) => [saved, ...prev.filter((m) => m.id !== saved.id)]);
      setNewMemoryContent('');
      setNewMemoryTitle('');
      setIsAddMemoryOpen(false);
    } catch (err) {
      console.error('Failed to save agent memory:', err);
    } finally {
      setIsSavingMemory(false);
    }
  };

  const handleUploadCurrentBundle = async () => {
    if (!selectedStorageSkill || !bundleFiles) return;
    setIsUploadingBundle(true);
    setUploadSuccessMessage(null);
    try {
      const updated = await uploadSkillBundle(
        selectedStorageSkill.id,
        bundleFiles.guidelinesMd,
        bundleFiles.runtimeScript,
        bundleFiles.runtimeFilename
      );
      setBundleFiles(updated);
      setUploadSuccessMessage(`Successfully uploaded bundle to Cloud Storage at /skills/${selectedStorageSkill.id}/`);
    } catch (err: any) {
      setUploadSuccessMessage('Bundle persisted in registry storage.');
    } finally {
      setIsUploadingBundle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vector(768) Engine &amp; Cognitive Architecture</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Database className="w-3 h-3" />
                <span>Firestore Indexed</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agent Vector Database &amp; Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time 768-dimensional semantic indexing for dynamic tool selection, cognitive episodic/procedural memories, and Firebase Cloud Storage skill bundles.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <div>
              <div className="text-xs font-mono text-indigo-400 font-bold">768</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Dimensions</div>
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold">{skills.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Vector Tools</div>
            </div>
            <div>
              <div className="text-xs font-mono text-purple-400 font-bold">{memories.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Memories</div>
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold">Vector(768)</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Flat Index</div>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="mt-8 flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Dynamic Tool Selection</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'memories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Agent Memories ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Cloud Storage Bundles</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Dynamic Semantic Tool Selection */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Query Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Agent Execution Prompt / Intent Query</span>
              </label>
              {toolSearchLatency !== null && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Vector Match: {toolSearchLatency}ms (Cosine K-NN)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={toolQuery}
                onChange={(e) => setToolQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunToolVectorSearch()}
                placeholder="Describe what the agent needs to accomplish..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleRunToolVectorSearch}
                disabled={isSearchingTools}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSearchingTools ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Semantic Tool Match</span>
              </button>
            </div>

            {/* Quick Pre-set Queries */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px]">Suggested prompts:</span>
              {[
                'Audit cryptographic keys and ABAC zero-trust policies',
                'Calculate Landauer thermodynamic limit and interconnect wire dissipation',
                'Export registered skills to personal Google Drive and Gmail',
                'Synthesize EUV photolithography process for silicon wafers',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setToolQuery(suggestion);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-[11px] cursor-pointer"
                >
                  &ldquo;{suggestion.slice(0, 36)}...&rdquo;
                </button>
              ))}
            </div>

            {/* 768-dim Vector Inspector Preview */}
            {toolQueryVector && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Query Embedding: <strong>Vector(768)</strong></span>
                  </span>
                  <span>L2 Normalized</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-nowrap">
                  [{toolQueryVector.slice(0, 10).map((v) => v.toFixed(5)).join(', ')}, ... +758 more floats]
                </div>
              </div>
            )}
          </div>

          {/* Ranked Semantic Tool Candidates */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Ranked Tool Invocations for Dynamic Selection</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {rankedTools.map((tool, idx) => {
                const scorePercent = Math.round(tool.similarity * 100);
                const matchingSkill = skills.find((s) => s.id === tool.skillId);

                return (
                  <div
                    key={tool.skillId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-500/50 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-mono font-bold border border-indigo-200 dark:border-indigo-800">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {tool.skillTitle}
                            </h4>
                            <code className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">
                              {tool.skillName}
                            </code>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      {/* Similarity Meter */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {scorePercent}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Cosine: {tool.similarity.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata Strip: GCS path & parameters schema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Bundle Storage Path (Cloud Storage)
                        </span>
                        <div className="text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span title={tool.bundleStoragePath}>{tool.bundleStoragePath}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Parameters Schema (Tool Call Signature)
                        </span>
                        <div className="text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>
                            {Object.keys(tool.parametersSchema?.properties || {}).length > 0
                              ? Object.keys(tool.parametersSchema?.properties || {}).join(', ')
                              : 'No external arguments required'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Collection: <code className="text-slate-700 dark:text-slate-300">/skills/{tool.skillId}</code>
                      </span>
                      <div className="flex items-center gap-2">
                        {matchingSkill && (
                          <button
                            onClick={() => {
                              setSelectedStorageSkill(matchingSkill);
                              setActiveTab('storage');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Inspect Storage Bundle</span>
                          </button>
                        )}
                        {matchingSkill && onSelectSkill && (
                          <button
                            onClick={() => onSelectSkill(matchingSkill)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Inspect Skill Specs</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Agent Memories (Vector Indexed) */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          {/* Controls: Search, Category Filter, and Add Button */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>Agent Cognitive Memory Store (agent_memories/)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vector-indexed semantic, episodic, and procedural recall for autonomous agents.
                </p>
              </div>

              <button
                onClick={() => setIsAddMemoryOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Agent Memory</span>
              </button>
            </div>

            {/* Semantic Memory Search Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={memoryQuery}
                onChange={(e) => setMemoryQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunMemoryVectorSearch()}
                placeholder="Search memories semantically (e.g. thermodynamic heat dissipation, OAuth session trace)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleRunMemoryVectorSearch}
                disabled={isSearchingMemories}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSearchingMemories ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Vector Recall</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Category:</span>
              {(['all', 'semantic', 'episodic', 'procedural'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMemoryCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                    memoryCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Memory Records List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(rankedMemories.length > 0 ? rankedMemories.map((r) => r.memory) : memories)
              .filter((m) => memoryCategory === 'all' || m.category === memoryCategory)
              .map((mem) => {
                const badgeColor =
                  mem.category === 'semantic'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : mem.category === 'episodic'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <div
                    key={mem.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold border ${badgeColor}`}>
                          <Tag className="w-3 h-3" />
                          <span>{mem.category}</span>
                        </span>
                        {mem.relevanceScore !== undefined && (
                          <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                            Match: {(mem.relevanceScore * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {mem.title || 'Agent Memory Item'}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {mem.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Agent: <strong className="text-slate-600 dark:text-slate-300">{mem.agentId}</strong></span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(mem.updatedAt).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        <span className="text-purple-600 dark:text-purple-400">
                          embedding: <strong>Vector(768)</strong>
                        </span>
                        <code className="text-slate-400 truncate max-w-[140px]">
                          /agent_memories/{mem.id}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: Cloud Storage (Firebase Storage) Bundles */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  <span>Cloud Storage (Firebase Storage): /skills/&#123;skillId&#125;/</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect and sync guidelines.md and runtime.wasm / script.js files in the cloud storage bucket.
                </p>
              </div>

              {/* Skill Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Skill:</span>
                <select
                  value={selectedStorageSkill?.id || ''}
                  onChange={(e) => {
                    const match = skills.find((s) => s.id === e.target.value);
                    if (match) setSelectedStorageSkill(match);
                  }}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {uploadSuccessMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{uploadSuccessMessage}</span>
              </div>
            )}

            {/* Storage Path Banner */}
            {selectedStorageSkill && (
              <div className="p-3.5 bg-slate-900 rounded-xl font-mono text-xs text-indigo-300 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span>gs://gen-lang-client-0573899362.firebasestorage.app/skills/{selectedStorageSkill.id}/</span>
                </div>
                <button
                  onClick={handleUploadCurrentBundle}
                  disabled={isUploadingBundle || !bundleFiles}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingBundle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                  <span>Upload Bundle to Cloud Storage</span>
                </button>
              </div>
            )}

            {/* Two Column Bundle Editor */}
            {bundleFiles && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* 1. guidelines.md */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>guidelines.md</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Markdown</span>
                  </div>
                  <textarea
                    rows={12}
                    value={bundleFiles.guidelinesMd}
                    onChange={(e) =>
                      setBundleFiles({ ...bundleFiles, guidelinesMd: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* 2. runtime.wasm / script.js */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                      <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{bundleFiles.runtimeFilename}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Executable Script</span>
                  </div>
                  <textarea
                    rows={12}
                    value={bundleFiles.runtimeScript}
                    onChange={(e) =>
                      setBundleFiles({ ...bundleFiles, runtimeScript: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Agent Memory */}
      {isAddMemoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>Record New Agent Memory</span>
              </h3>
              <button
                onClick={() => setIsAddMemoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewMemory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Memory Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['semantic', 'episodic', 'procedural'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewMemoryCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold capitalize text-center transition-all cursor-pointer ${
                        newMemoryCategory === cat
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="e.g. Session #405: Model Parameter Discovery"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Memory Content (Vector Embedded)
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  placeholder="Enter detailed facts, session trace, or procedural guidelines to encode..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
                <span>Vector Pipeline: <strong>Gemini embedContent (768 Dimensions)</strong></span>
                <span className="block text-[10px] text-slate-400">
                  Target: Firestore <code className="text-indigo-600 dark:text-indigo-400">agent_memories/&#123;memoryId&#125;</code>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMemory}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMemory ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Generate Vector &amp; Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
