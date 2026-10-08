import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Wand2,
  FileCode,
  Sliders,
  BookmarkCheck,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Cpu,
  Layers,
} from 'lucide-react';
import type {
  SkillRecord,
  SkillParameter,
  SkillReference,
  SkillExample,
  SkillCodeFile,
} from '../types/skill';
import {
  parseSkillMarkdown,
  generateSkillMarkdown,
} from '../services/skillParser';

interface SkillEditorModalProps {
  isOpen: boolean;
  initialSkill?: SkillRecord | null;
  onClose: () => void;
  onSave: (skill: SkillRecord) => Promise<void>;
  currentUserId: string;
  currentUserEmail?: string;
}

export const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  isOpen,
  initialSkill,
  onClose,
  onSave,
  currentUserId,
  currentUserEmail,
}) => {
  const [mode, setMode] = useState<'markdown' | 'form'>('markdown');
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('orchestration');
  const [version, setVersion] = useState('1.0.0');
  const [securityClearance, setSecurityClearance] = useState<'public' | 'internal' | 'admin-only'>('public');
  const [isExecutable, setIsExecutable] = useState(true);
  const [runtime, setRuntime] = useState<'mcp' | 'in_process' | 'cloud_function'>('in_process');
  const [sourceReferencesStr, setSourceReferencesStr] = useState('');
  const [returnsSchemaStr, setReturnsSchemaStr] = useState('{\n  "type": "object",\n  "description": "Standard execution payload"\n}');
  const [parameters, setParameters] = useState<SkillParameter[]>([]);
  const [examples, setExamples] = useState<SkillExample[]>([]);
  const [references, setReferences] = useState<SkillReference[]>([]);
  const [codeFiles, setCodeFiles] = useState<Record<string, SkillCodeFile>>({});

  useEffect(() => {
    if (initialSkill) {
      setRawMarkdown(initialSkill.skillMarkdown);
      setName(initialSkill.name);
      setTitle(initialSkill.title);
      setDescription(initialSkill.description);
      setCategory(initialSkill.category);
      setVersion(initialSkill.version);
      if (initialSkill.securityClearance) setSecurityClearance(initialSkill.securityClearance);
      if (initialSkill.isExecutable !== undefined) setIsExecutable(initialSkill.isExecutable);
      if (initialSkill.runtime) setRuntime(initialSkill.runtime);
      if (initialSkill.sourceReferences) setSourceReferencesStr(initialSkill.sourceReferences.join('\n'));
      if (initialSkill.returns) setReturnsSchemaStr(initialSkill.returns);

      try {
        if (initialSkill.parameters) setParameters(JSON.parse(initialSkill.parameters));
        if (initialSkill.examples) setExamples(JSON.parse(initialSkill.examples));
        if (initialSkill.references) setReferences(JSON.parse(initialSkill.references));
        if (initialSkill.codeFiles) setCodeFiles(JSON.parse(initialSkill.codeFiles));
      } catch (e) {
        console.error('Error hydrating form state', e);
      }
    } else {
      // Default starter template for the write-skill philosophy
      const starterTemplate = `---
name: custom-agent-skill
title: Custom Agent Capability
version: 1.0.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/custom-skill.ipynb"
description: Detailed operational capabilities and execution boundary.
dependencies: ["lucide-react"]
priority: 1
thermodynamicFootprint: low
---

# Custom Agent Capability

## Description & Mission
Describe what this skill executes, its preconditions, and output quality standards.

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
|---|---|---|---|
| \`targetGoal\` | \`string\` | true | The primary objective of the skill. |
| \`format\` | \`string\` | false | Output encoding (e.g. json, text). |

## Operational Rules & Preconditions
- Validate all incoming parameters prior to mutation.
- Enforce least privilege and user confirmation for external mutations.

## In-Context Examples & Multi-Turn Walkthroughs
### Example 1: Standard Invocations
**Prompt**: "Execute task according to custom parameters"
**Expected Outcome**: Returns structured result conforming to schema.
`;
      setRawMarkdown(starterTemplate);
      const parsed = parseSkillMarkdown(starterTemplate, currentUserId);
      setName(parsed.skill.name || 'custom-agent-skill');
      setTitle(parsed.skill.title || 'Custom Agent Capability');
      setDescription(parsed.skill.description || '');
      setCategory('orchestration');
      setSecurityClearance('public');
      setIsExecutable(true);
      setRuntime('in_process');
    }
  }, [initialSkill, currentUserId]);

  // Live validate whenever markdown changes in markdown mode
  useEffect(() => {
    if (mode === 'markdown' && rawMarkdown) {
      const result = parseSkillMarkdown(rawMarkdown, currentUserId);
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
    }
  }, [rawMarkdown, mode, currentUserId]);

  if (!isOpen) return null;

  const handleSyncToMarkdown = () => {
    const syntheticSkill: Partial<SkillRecord> = {
      name,
      title,
      description,
      category,
      version,
      securityClearance,
      isExecutable,
      runtime,
      sourceReferences: sourceReferencesStr.split('\n').map((s) => s.trim()).filter(Boolean),
      returns: returnsSchemaStr,
      parameters: JSON.stringify(parameters),
      examples: JSON.stringify(examples),
      references: JSON.stringify(references),
      codeFiles: JSON.stringify(codeFiles),
      dependencies: JSON.stringify(['@types/node']),
    };
    const generated = generateSkillMarkdown(syntheticSkill);
    setRawMarkdown(generated);
    setMode('markdown');
  };

  const handleSyncToForm = () => {
    const result = parseSkillMarkdown(rawMarkdown, currentUserId);
    if (result.skill.name) setName(result.skill.name);
    if (result.skill.title) setTitle(result.skill.title);
    if (result.skill.description) setDescription(result.skill.description);
    if (result.skill.category) setCategory(result.skill.category);
    if (result.skill.version) setVersion(result.skill.version);
    if (result.skill.securityClearance) setSecurityClearance(result.skill.securityClearance);
    if (result.skill.isExecutable !== undefined) setIsExecutable(result.skill.isExecutable);
    if (result.skill.runtime) setRuntime(result.skill.runtime);
    if (result.skill.sourceReferences) setSourceReferencesStr(result.skill.sourceReferences.join('\n'));
    if (result.skill.returns) setReturnsSchemaStr(result.skill.returns);

    try {
      if (result.skill.parameters) setParameters(JSON.parse(result.skill.parameters));
      if (result.skill.examples) setExamples(JSON.parse(result.skill.examples));
      if (result.skill.references) setReferences(JSON.parse(result.skill.references));
      if (result.skill.codeFiles) setCodeFiles(JSON.parse(result.skill.codeFiles));
    } catch (e) {
      console.error(e);
    }
    setMode('form');
  };

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      {
        name: `param_${parameters.length + 1}`,
        type: 'string',
        required: true,
        description: 'Parameter description',
      },
    ]);
  };

  const handleAddExample = () => {
    setExamples([
      ...examples,
      {
        title: `Walkthrough ${examples.length + 1}`,
        scenario: 'Context scenario for invocation',
        prompt: 'User request prompt',
        invocations: '',
        expectedOutcome: 'Expected agent action or output',
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalSkillRecord: SkillRecord;

      if (mode === 'markdown') {
        const parsed = parseSkillMarkdown(rawMarkdown, currentUserId);
        const now = new Date().toISOString();
        finalSkillRecord = {
          id: parsed.skill.name || initialSkill?.id || `skill_${Date.now()}`,
          name: parsed.skill.name || 'unnamed-skill',
          title: parsed.skill.title || 'Untitled Skill',
          description: parsed.skill.description || '',
          category: parsed.skill.category || 'orchestration',
          version: parsed.skill.version || '1.0.0',
          securityClearance: parsed.skill.securityClearance || 'public',
          isExecutable: parsed.skill.isExecutable ?? true,
          runtime: parsed.skill.runtime || 'in_process',
          returns: parsed.skill.returns || returnsSchemaStr,
          sourceReferences: parsed.skill.sourceReferences || [],
          authorId: initialSkill?.authorId || currentUserId,
          authorEmail: initialSkill?.authorEmail || currentUserEmail || 'isaiah9238@gmail.com',
          skillMarkdown: rawMarkdown,
          summaryJson: parsed.skill.summaryJson || JSON.stringify(parsed.summaryJson, null, 2),
          parameters: parsed.skill.parameters || '[]',
          examples: parsed.skill.examples || '[]',
          references: parsed.skill.references || '[]',
          dependencies: parsed.skill.dependencies || '[]',
          codeFiles: parsed.skill.codeFiles || '{}',
          status: parsed.isValid ? 'verified' : 'draft',
          isPublic: (parsed.skill.securityClearance || 'public') !== 'admin-only',
          createdAt: initialSkill?.createdAt || now,
          updatedAt: now,
        };
      } else {
        const srcRefs = sourceReferencesStr.split('\n').map((s) => s.trim()).filter(Boolean);
        const syntheticSkill: Partial<SkillRecord> = {
          name,
          title,
          description,
          category,
          version,
          securityClearance,
          isExecutable,
          runtime,
          sourceReferences: srcRefs,
          returns: returnsSchemaStr,
          parameters: JSON.stringify(parameters),
          examples: JSON.stringify(examples),
          references: JSON.stringify(references),
          codeFiles: JSON.stringify(codeFiles),
        };
        const md = generateSkillMarkdown(syntheticSkill);
        const parsed = parseSkillMarkdown(md, currentUserId);
        const now = new Date().toISOString();

        finalSkillRecord = {
          id: name || initialSkill?.id || `skill_${Date.now()}`,
          name,
          title,
          description,
          category,
          version,
          securityClearance,
          isExecutable,
          runtime,
          returns: returnsSchemaStr,
          sourceReferences: srcRefs,
          authorId: initialSkill?.authorId || currentUserId,
          authorEmail: initialSkill?.authorEmail || currentUserEmail || 'isaiah9238@gmail.com',
          skillMarkdown: md,
          summaryJson: JSON.stringify(parsed.summaryJson, null, 2),
          parameters: JSON.stringify(parameters, null, 2),
          examples: JSON.stringify(examples, null, 2),
          references: JSON.stringify(references, null, 2),
          dependencies: JSON.stringify(['@types/node'], null, 2),
          codeFiles: JSON.stringify(codeFiles, null, 2),
          status: 'verified',
          isPublic: securityClearance !== 'admin-only',
          createdAt: initialSkill?.createdAt || now,
          updatedAt: now,
        };
      }

      await onSave(finalSkillRecord);
      onClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-500" />
              <span>{initialSkill ? 'Edit Skill Specification' : 'Author New SKILL.md'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compliant with the Agent Engine registration standard and ingestion pipeline format.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  if (mode === 'form') handleSyncToMarkdown();
                  else setMode('markdown');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mode === 'markdown'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                SKILL.md Editor
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'markdown') handleSyncToForm();
                  else setMode('form');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mode === 'form'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Visual Schema Form
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
          {mode === 'markdown' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">
                  Direct raw markdown input with frontmatter (---) and standard sections.
                </span>
                <div className="flex items-center gap-2">
                  {validationErrors.length === 0 ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ingestion Validated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.length} Schema Issue(s)
                    </span>
                  )}
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <span className="font-semibold block">Validation Errors:</span>
                  {validationErrors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}

              <textarea
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                rows={22}
                className="w-full p-4 font-mono text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                placeholder="---&#10;name: my-skill&#10;description: ...&#10;---&#10;&#10;# My Skill Title&#10;..."
              />
            </div>
          ) : (
            /* Visual Form Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Machine Identifier (Slug) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    placeholder="e.g. data-pipeline-cleaner"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Human-Readable Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Autonomous Data Pipeline Sanitizer"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category (Notebook Domain)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="security-audit">security-audit</option>
                    <option value="orchestration">orchestration</option>
                    <option value="workflow-automation">workflow-automation</option>
                    <option value="math-geometry">math-geometry</option>
                    <option value="system-tool">system-tool</option>
                    <option value="meta-engineering">meta-engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Runtime
                  </label>
                  <select
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="in_process">in_process (Local Worker)</option>
                    <option value="mcp">mcp (Model Context Protocol)</option>
                    <option value="cloud_function">cloud_function (Serverless API)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ABAC Security Clearance
                  </label>
                  <select
                    value={securityClearance}
                    onChange={(e) => setSecurityClearance(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="public">public (Open Access)</option>
                    <option value="internal">internal (Signed-in Users)</option>
                    <option value="admin-only">admin-only (Admins Only)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Executable Toggle */}
              <div className="p-3 bg-slate-100/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Active Runtime Tool Execution (isExecutable)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Enable tool call invocation bindings for active agent execution engines.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExecutable}
                    onChange={(e) => setIsExecutable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Source References & Return Schema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Studio Alchemist Notebook Sources (sourceReferences, 1 per line)
                  </label>
                  <textarea
                    value={sourceReferencesStr}
                    onChange={(e) => setSourceReferencesStr(e.target.value)}
                    rows={3}
                    placeholder="notebook://studio-alchemist/domain.ipynb&#10;https://docs.alchemist.ai/spec-1"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Output Return Schema (returns JSON Schema)
                  </label>
                  <textarea
                    value={returnsSchemaStr}
                    onChange={(e) => setReturnsSchemaStr(e.target.value)}
                    rows={3}
                    placeholder='{"type": "object", "properties": {"result": {"type": "string"}}}'
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description &amp; Trigger Boundaries *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain exactly what this skill accomplishes and its selection preconditions..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Parameters List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Parameters Schema ({parameters.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {parameters.map((param, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-xs"
                    >
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => {
                          const updated = [...parameters];
                          updated[idx].name = e.target.value;
                          setParameters(updated);
                        }}
                        placeholder="paramName"
                        className="font-mono px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                      />
                      <input
                        type="text"
                        value={param.type}
                        onChange={(e) => {
                          const updated = [...parameters];
                          updated[idx].type = e.target.value;
                          setParameters(updated);
                        }}
                        placeholder="type (string, number)"
                        className="font-mono px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                      />
                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) => {
                          const updated = [...parameters];
                          updated[idx].description = e.target.value;
                          setParameters(updated);
                        }}
                        placeholder="Description..."
                        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => {
                              const updated = [...parameters];
                              updated[idx].required = e.target.checked;
                              setParameters(updated);
                            }}
                          />
                          <span>Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setParameters(parameters.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>In-Context Walkthrough Examples ({examples.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Example</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={ex.title}
                          onChange={(e) => {
                            const updated = [...examples];
                            updated[idx].title = e.target.value;
                            setExamples(updated);
                          }}
                          placeholder="Example title"
                          className="font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded flex-1 mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => setExamples(examples.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ex.prompt}
                        onChange={(e) => {
                          const updated = [...examples];
                          updated[idx].prompt = e.target.value;
                          setExamples(updated);
                        }}
                        placeholder="User prompt or trigger instruction"
                        className="w-full font-mono px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                      />
                      <input
                        type="text"
                        value={ex.expectedOutcome}
                        onChange={(e) => {
                          const updated = [...examples];
                          updated[idx].expectedOutcome = e.target.value;
                          setExamples(updated);
                        }}
                        placeholder="Expected outcome"
                        className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Registration target: <span className="font-mono font-semibold">/skills/{name || 'custom-agent-skill'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Persist to Registry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
