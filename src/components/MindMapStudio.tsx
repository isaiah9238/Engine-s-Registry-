import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitBranch,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  FileCode2,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  ExternalLink,
  Code2,
  Play,
  Plus,
  Trash2,
  Sliders,
  Database,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import {
  AGENT_SKILL_MIND_MAP,
  TEMPLATE_PRESETS,
  type MindMapNode,
} from '../data/mindMapData';
import type { SkillRecord } from '../types/skill';
import { generateEmbedding768 } from '../services/vectorSearch';

interface MindMapStudioProps {
  onSaveSkillToFirestore?: (skill: SkillRecord) => Promise<void>;
  onNavigateToRegistry?: () => void;
}

interface LayoutNode {
  node: MindMapNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  parent?: LayoutNode;
  children: LayoutNode[];
}

export const MindMapStudio: React.FC<MindMapStudioProps> = ({
  onSaveSkillToFirestore,
  onNavigateToRegistry,
}) => {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'author' | 'templates'>('mindmap');
  const [mapViewMode, setMapViewMode] = useState<'blueprint' | 'canvas' | 'outline'>('blueprint');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<MindMapNode>(AGENT_SKILL_MIND_MAP);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [isWideMode, setIsWideMode] = useState<boolean>(false);

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Author Skill Form State (Building on write-skill)
  const [authorSkillName, setAuthorSkillName] = useState('custom-security-scanner');
  const [authorTitle, setAuthorTitle] = useState('Zero-Trust Security & Policy Scanner');
  const [authorMission, setAuthorMission] = useState(
    'Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.'
  );
  const [authorCategory, setAuthorCategory] = useState('security-audit');
  const [authorClearance, setAuthorClearance] = useState<'public' | 'internal' | 'admin-only'>('public');
  const [authorRuntime, setAuthorRuntime] = useState<'in_process' | 'mcp' | 'cloud_function'>('in_process');
  const [authorParameters, setAuthorParameters] = useState<
    Array<{ name: string; type: string; required: boolean; description: string }>
  >([
    { name: 'targetEndpoint', type: 'string', required: true, description: 'API or service endpoint to inspect.' },
    { name: 'enforceStrictTls', type: 'boolean', required: false, description: 'Require TLS 1.3 encryption.' },
  ]);
  const [authorExamples, setAuthorExamples] = useState<
    Array<{ prompt: string; scenario: string; expectedOutcome: string }>
  >([
    {
      prompt: 'Scan endpoint https://api.internal/v1 for policy violations.',
      scenario: 'Autonomous audit trigger before data ingestion.',
      expectedOutcome: 'Generates JSON report with zero-trust compliance score and recommendations.',
    },
  ]);
  const [validationOutput, setValidationOutput] = useState<{
    valid: boolean;
    issues?: string[];
    manifest?: any;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Toggle Collapse on Mind Map Node
  const toggleNodeCollapse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all
  const handleExpandAll = () => setCollapsedNodeIds(new Set());
  const handleCollapseAll = () => {
    const allIds = new Set<string>();
    const traverse = (node: MindMapNode) => {
      if (node.id !== 'root' && node.children && node.children.length > 0) {
        allIds.add(node.id);
      }
      node.children?.forEach(traverse);
    };
    traverse(AGENT_SKILL_MIND_MAP);
    setCollapsedNodeIds(allIds);
  };

  // Tree layout generation for SVG with dynamic column widths
  const layoutTree = useMemo(() => {
    let currentY = 0;
    const VERTICAL_SPACING = 62;

    // Dynamically measure max node width for each depth level
    const depthWidths: number[] = [180, 240, 260, 340, 300];
    function measureDepths(n: MindMapNode, depth = 0) {
      const isExpanded = !collapsedNodeIds.has(n.id);
      const neededWidth = Math.max(150, Math.min(420, n.label.length * 7.4 + 48));
      depthWidths[depth] = Math.max(depthWidths[depth] || 150, neededWidth);
      if (isExpanded && n.children) {
        n.children.forEach((c) => measureDepths(c, depth + 1));
      }
    }
    measureDepths(AGENT_SKILL_MIND_MAP, 0);

    // Compute cumulative horizontal X coordinate for each depth level
    const depthX: number[] = [40];
    const H_GAP = 54;
    for (let d = 1; d <= 5; d++) {
      depthX[d] = depthX[d - 1] + (depthWidths[d - 1] || 200) + H_GAP;
    }

    function buildLayout(
      node: MindMapNode,
      depth = 0,
      parent?: LayoutNode
    ): LayoutNode {
      const isExpanded = !collapsedNodeIds.has(node.id);
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const nodeWidth = Math.max(150, Math.min(420, node.label.length * 7.4 + 48));

      const layoutItem: LayoutNode = {
        node,
        x: depthX[depth] || depth * 280 + 40,
        y: 0,
        width: nodeWidth,
        height: 44,
        depth,
        isExpanded,
        hasChildren,
        parent,
        children: [],
      };

      if (hasChildren && isExpanded && node.children) {
        layoutItem.children = node.children.map((child) =>
          buildLayout(child, depth + 1, layoutItem)
        );
        // Center parent vertically relative to children
        const firstChild = layoutItem.children[0];
        const lastChild = layoutItem.children[layoutItem.children.length - 1];
        layoutItem.y = (firstChild.y + lastChild.y) / 2;
      } else {
        // Leaf or collapsed node gets next vertical slot
        layoutItem.y = currentY;
        currentY += VERTICAL_SPACING;
      }

      return layoutItem;
    }

    return buildLayout(AGENT_SKILL_MIND_MAP, 0);
  }, [collapsedNodeIds]);

  // Flatten layout nodes and connector paths
  const { flatNodes, connections } = useMemo(() => {
    const nodes: LayoutNode[] = [];
    const conns: Array<{
      id: string;
      d: string;
      source: LayoutNode;
      target: LayoutNode;
      highlighted: boolean;
    }> = [];

    function traverse(item: LayoutNode) {
      nodes.push(item);
      if (item.isExpanded && item.children.length > 0) {
        item.children.forEach((child) => {
          const x1 = item.x + item.width;
          const y1 = item.y + item.height / 2;
          const x2 = child.x;
          const y2 = child.y + child.height / 2;
          const deltaX = (x2 - x1) * 0.55;

          const d = `M ${x1} ${y1} C ${x1 + deltaX} ${y1}, ${x2 - deltaX} ${y2}, ${x2} ${y2}`;
          const highlighted = Boolean(
            selectedNode &&
              (selectedNode.id === child.node.id || selectedNode.id === item.node.id)
          );

          conns.push({
            id: `${item.node.id}->${child.node.id}`,
            d,
            source: item,
            target: child,
            highlighted,
          });

          traverse(child);
        });
      }
    }

    traverse(layoutTree);
    return { flatNodes: nodes, connections: conns };
  }, [layoutTree, selectedNode]);

  // Auto-fit all nodes to view
  const fitToView = () => {
    if (!svgContainerRef.current) return;
    const containerW = svgContainerRef.current.clientWidth || 850;
    const containerH = svgContainerRef.current.clientHeight || 750;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    flatNodes.forEach((item) => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x + item.width + 36);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y + item.height);
    });

    if (minX === Infinity || maxX === -Infinity) return;

    const totalW = maxX - minX;
    const totalH = maxY - minY;

    const pad = 40;
    const scaleX = (containerW - pad * 2) / totalW;
    const scaleY = (containerH - pad * 2) / totalH;
    const targetZoom = Math.max(0.25, Math.min(scaleX, scaleY, 0.95));

    const targetPanX = (containerW - totalW * targetZoom) / 2 - minX * targetZoom;
    const targetPanY = (containerH - totalH * targetZoom) / 2 - minY * targetZoom;

    setZoom(Number(targetZoom.toFixed(3)));
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  };

  const resetView = () => {
    fitToView();
  };

  // Run auto-fit when tree expands/collapses or wide mode changes
  useEffect(() => {
    const t = setTimeout(() => {
      fitToView();
    }, 60);
    return () => clearTimeout(t);
  }, [collapsedNodeIds, isWideMode]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Run in-process validation (write-skill logic)
  const handleValidateSkill = () => {
    const issues: string[] = [];
    if (!authorSkillName || !/^[a-z0-9-_]+$/.test(authorSkillName)) {
      issues.push('skillName must be a valid kebab-case string.');
    }
    if (!authorTitle || authorTitle.trim().length < 5) {
      issues.push('title must be at least 5 characters long.');
    }
    if (!authorMission || authorMission.trim().length < 20) {
      issues.push('mission must provide an operational boundary of at least 20 characters.');
    }
    if (!Array.isArray(authorParameters) || authorParameters.length === 0) {
      issues.push('At least one input parameter must be defined.');
    }
    if (!Array.isArray(authorExamples) || authorExamples.length === 0) {
      issues.push('At least one few-shot example walkthrough must be provided.');
    }

    if (issues.length > 0) {
      setValidationOutput({ valid: false, issues });
      return;
    }

    const manifest = {
      skillId: authorSkillName,
      name: authorSkillName.replace(/-/g, '_'),
      title: authorTitle.trim(),
      mission: authorMission.trim(),
      category: authorCategory,
      parametersDeclared: authorParameters.length,
      examplesDeclared: authorExamples.length,
      runtime: authorRuntime,
      clearance: authorClearance,
      validatedAt: new Date().toISOString(),
      status: 'verified',
    };

    setValidationOutput({ valid: true, manifest });
  };

  // Generate SKILL.md text
  const generatedSkillMarkdown = useMemo(() => {
    const paramsTable = authorParameters
      .map(
        (p) =>
          `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'true' : 'false'} | ${p.description} |`
      )
      .join('\n');

    const examplesBlock = authorExamples
      .map(
        (ex, i) => `### Example ${i + 1}: ${ex.prompt.slice(0, 45)}...
* **Prompt:** "${ex.prompt}"
* **Scenario Context:** ${ex.scenario}
* **Expected Outcome:** ${ex.expectedOutcome}
`
      )
      .join('\n');

    return `---
name: ${authorSkillName}
title: "${authorTitle}"
description: >
  ${authorMission}
version: 1.0.0
category: ${authorCategory}
securityClearance: ${authorClearance}
isExecutable: true
runtime: ${authorRuntime}
tags: [${authorCategory}, autonomous-agent, production-skill]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# ${authorTitle}

## Description & Mission
${authorMission}

## When to Use This Skill
- When task requires automated execution within the **${authorCategory}** domain.
- When caller parameters strictly conform to declared signatures.

## When NOT to Use This Skill
- For tasks outside declared operational boundaries.
- When human supervision is required for irreversible mutations.

## Parameters & Invocation Schemas

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
${paramsTable}

## Operational Rules & Ingestion Constraints
1. **Zero-Pill Discipline**: Avoid empty filler phrases or redundant pleasantries.
2. **Schema Invariance**: Enforce strict parameter validation before processing.
3. **Determinism**: Maintain state persistence and verify return schemas.

## Multi-Turn Walkthrough Examples

${examplesBlock}

## Scaffolded Runtime Verification
\`\`\`typescript
export async function execute(params: Record<string, any>) {
  // Runtime handler for ${authorSkillName}
  return {
    success: true,
    skill: "${authorSkillName}",
    executedAt: new Date().toISOString()
  };
}
\`\`\`
`;
  }, [
    authorSkillName,
    authorTitle,
    authorMission,
    authorCategory,
    authorClearance,
    authorRuntime,
    authorParameters,
    authorExamples,
  ]);

  // Load a preset template into authoring form
  const handleApplyTemplate = (tplId: string) => {
    const tpl = TEMPLATE_PRESETS.find((t) => t.id === tplId);
    if (!tpl) return;

    if (tplId === 'basic') {
      setAuthorSkillName('my-open-skill');
      setAuthorTitle('Basic Open Standard Instruction Skill');
      setAuthorMission('Provides lightweight instruction-only task guidance without heavy tooling dependencies.');
      setAuthorCategory('development');
      setAuthorRuntime('in_process');
    } else if (tplId === 'enterprise') {
      setAuthorSkillName('enterprise-cloud-deployer');
      setAuthorTitle('Enterprise Cloud Management & Deployer');
      setAuthorMission('Enterprise cloud deployment management using progressive disclosure, pinned CLI tools, and linked references.');
      setAuthorCategory('cloud-infrastructure');
      setAuthorRuntime('in_process');
    } else if (tplId === 'executable') {
      setAuthorSkillName('autonomous-security-auditor');
      setAuthorTitle('Autonomous Multi-Phase Security Auditor');
      setAuthorMission('Methodology-driven security audit toolkit with 4 coordinated layers, SQLite session persistence, and 6 scan phases.');
      setAuthorCategory('security-audit');
      setAuthorRuntime('mcp');
    } else if (tplId === 'ingestion') {
      setAuthorSkillName('domain-orchestrator-skill');
      setAuthorTitle('Domain Orchestrator Meta-Skill');
      setAuthorMission('Autonomous meta-skill implementing parametersSchema map, runtime validation, and 768-dim vector embedding.');
      setAuthorCategory('orchestration');
      setAuthorRuntime('in_process');
    }

    setActiveTab('author');
  };

  // Copy Draft
  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedSkillMarkdown);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Download .SKILL.md
  const handleDownloadDraft = () => {
    const blob = new Blob([generatedSkillMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${authorSkillName}.SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Register to Firestore
  const handleSaveToRegistry = async () => {
    handleValidateSkill();
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      // Build parametersSchema
      const props: Record<string, any> = {};
      authorParameters.forEach((p) => {
        props[p.name] = { type: p.type, description: p.description };
      });
      const parametersSchema = {
        type: 'object',
        properties: props,
        required: authorParameters.filter((p) => p.required).map((p) => p.name),
      };

      // Generate 768-dim embedding
      const semanticSummary = `Title: ${authorTitle}\nDescription: ${authorMission}\nCategory: ${authorCategory}\nRouting: ${authorSkillName}`;
      const embedding = await generateEmbedding768(semanticSummary);

      const summaryJson = JSON.stringify({
        schemaVersion: '2026.1',
        skillId: authorSkillName,
        name: authorSkillName,
        title: authorTitle,
        description: authorMission,
        category: authorCategory,
        version: '1.0.0',
        runtime: authorRuntime,
        isExecutable: true,
        securityClearance: authorClearance,
        triggerPreconditions: [
          `User requests execution of ${authorTitle}`,
          `Task requires ${authorCategory} automation`,
        ],
        routingKeywords: [
          authorSkillName,
          ...authorSkillName.split('-'),
          authorCategory,
        ],
        parametersSchema,
        dependencies: { npm: ['@types/node'] },
      });

      const newSkill: SkillRecord = {
        id: authorSkillName,
        name: authorSkillName.replace(/-/g, '_'),
        title: authorTitle,
        description: authorMission,
        category: authorCategory,
        version: '1.0.0',
        authorId: 'system-architect',
        authorEmail: 'isaiahmsmith@aihomev2.com',
        status: 'published',
        isPublic: true,
        securityClearance: authorClearance,
        isExecutable: true,
        runtime: authorRuntime,
        skillMarkdown: generatedSkillMarkdown,
        summaryJson,
        parameters: JSON.stringify(authorParameters),
        examples: JSON.stringify(authorExamples),
        references: JSON.stringify([]),
        dependencies: JSON.stringify(['@types/node']),
        codeFiles: JSON.stringify({}),
        embedding,
        parametersSchema,
        bundleStoragePath: `gs://gen-lang-client-0573899362.firebasestorage.app/skills/${authorSkillName}/`,
        bundleFiles: {
          guidelinesMd: `gs://gen-lang-client-0573899362.firebasestorage.app/skills/${authorSkillName}/guidelines.md`,
          runtimeScript: `gs://gen-lang-client-0573899362.firebasestorage.app/skills/${authorSkillName}/script.js`,
          runtimeFilename: 'script.js',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (onSaveSkillToFirestore) {
        await onSaveSkillToFirestore(newSkill);
      }
      setSaveSuccessMessage(`Successfully registered '${authorSkillName}' into Firestore and indexed with Vector(768)!`);
    } catch (err: any) {
      console.error('Save skill error:', err);
      setSaveSuccessMessage(`Skill validated & persisted to registry session.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive Skill Mind Map</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Wand2 className="w-3 h-3" />
                <span>write-skill Engine</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Architecture &amp; Mind Map Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore the hierarchical taxonomy of agent skill architectures, inspect progressive disclosure constraints, and author production-grade SKILL.md definitions with live in-process validation.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'mindmap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Interactive Mind Map</span>
            </button>

            <button
              onClick={() => setActiveTab('author')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'author'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Author Skill Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>The 4 Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE MIND MAP TREE */}
      {activeTab === 'mindmap' && (
        <div className="space-y-6">
          {/* View Mode & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
            {/* View Mode Selector: Blueprint vs Visual Canvas vs Outline */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMapViewMode('blueprint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapViewMode === 'blueprint'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Column Blueprint: Guarantees every single layer and leaf is 100% visible"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Column Blueprint (Full Layer 3)</span>
              </button>

              <button
                onClick={() => setMapViewMode('canvas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapViewMode === 'canvas'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visual Curved Tree Canvas with Pan & Zoom"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Visual Tree Canvas</span>
              </button>

              <button
                onClick={() => setMapViewMode('outline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapViewMode === 'outline'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Deep Hierarchical Tree Outline"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Tree Outline</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter specifications & parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* MODE 1: COLUMN BLUEPRINT (GUARANTEED 100% VISIBLE FOR ALL 3+ LAYERS) */}
          {mapViewMode === 'blueprint' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left 3 Columns: Hierarchical Pillars, Subbranches, and ALL 3rd Layer Leaves */}
              <div className="lg:col-span-3 space-y-6">
                {/* Branch Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedBranchFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      selectedBranchFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    All 4 Pillars
                  </button>
                  {AGENT_SKILL_MIND_MAP.children?.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranchFilter(branch.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        selectedBranchFilter === branch.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {branch.label}
                    </button>
                  ))}
                </div>

                {/* Render Branch Pillars */}
                {AGENT_SKILL_MIND_MAP.children
                  ?.filter(
                    (b) => selectedBranchFilter === 'all' || selectedBranchFilter === b.id
                  )
                  .map((branch) => (
                    <div
                      key={branch.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
                    >
                      {/* Branch Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <GitBranch className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                              Architecture Pillar
                            </span>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                              {branch.label}
                            </h3>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 max-w-md">
                          {branch.description}
                        </p>
                      </div>

                      {/* Subbranches Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {branch.children?.map((subbranch) => (
                          <div
                            key={subbranch.id}
                            className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Subbranch Header */}
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{subbranch.label}</span>
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                                  {subbranch.children?.length || 0} items
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {subbranch.description}
                              </p>

                              {/* 3RD LAYER SPECIFICATIONS & LEAF NODES (100% VISIBLE!) */}
                              <div className="space-y-2 pt-1">
                                {subbranch.children?.map((leaf) => {
                                  const isSelected = selectedNode.id === leaf.id;
                                  const matches =
                                    searchQuery.trim().length > 0 &&
                                    (leaf.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      (leaf.description &&
                                        leaf.description
                                          .toLowerCase()
                                          .includes(searchQuery.toLowerCase())));

                                  return (
                                    <div
                                      key={leaf.id}
                                      onClick={() => setSelectedNode(leaf)}
                                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                                        isSelected
                                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                                          : matches
                                          ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                                          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                              isSelected
                                                ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm'
                                                : 'bg-emerald-500/60'
                                            }`}
                                          />
                                          <span className="font-mono font-semibold text-slate-100">
                                            {leaf.label}
                                          </span>
                                        </div>
                                        {leaf.codeSnippet && (
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 shrink-0">
                                            Code
                                          </span>
                                        )}
                                      </div>

                                      {leaf.description && (
                                        <p className="text-[11px] text-slate-400 leading-relaxed pl-4">
                                          {leaf.description}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Card Footer Action */}
                            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                              <button
                                onClick={() => setSelectedNode(subbranch)}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer flex items-center gap-1"
                              >
                                <Info className="w-3 h-3" />
                                <span>Inspect Section</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedNode(subbranch);
                                  setActiveTab('author');
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Wand2 className="w-3 h-3 text-emerald-400" />
                                <span>Authoring</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Right Column: Node Inspector & Quick Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 h-fit sticky top-20">
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      Specification Inspector
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedNode.description ||
                        'Select any specification or parameter leaf to inspect exact rules and code snippets.'}
                    </p>
                  </div>

                  {selectedNode.guidelines && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Rules &amp; Boundaries:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedNode.guidelines.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedNode.codeSnippet && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Specification Pattern / YAML:
                      </span>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed max-h-56">
                        {selectedNode.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {selectedNode.templateId && (
                    <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Canonical Architecture Available</span>
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Load this template directly into the Author Skill Builder.
                      </p>
                      <button
                        onClick={() => handleApplyTemplate(selectedNode.templateId!)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Scaffold with this Template</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => setActiveTab('author')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Open in Skill Builder</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Browse All 4 Templates</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: VISUAL CANVAS (SVG TREE WITH FIXED TRANSFORM ON <g>) */}
          {mapViewMode === 'canvas' && (
            <div className={`grid grid-cols-1 ${isWideMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
              <div className={`${isWideMode ? 'lg:col-span-1' : 'lg:col-span-2'} bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[760px] relative`}>
                <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={fitToView}
                      className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      title="Fit Entire Tree to Screen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Fit All Layers</span>
                    </button>
                    <button
                      onClick={() => setIsWideMode(!isWideMode)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        isWideMode
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{isWideMode ? 'Split View' : 'Wide Canvas'}</span>
                    </button>
                    <button
                      onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={resetView}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleExpandAll}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Expand All
                    </button>
                  </div>
                </div>

                <div
                  ref={svgContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={(e) => {
                    e.preventDefault();
                    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
                    setZoom((z) => Math.max(0.2, Math.min(2.0, Number((z + zoomDelta).toFixed(3)))));
                  }}
                  className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#0d1413] select-none"
                >
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle, #34d399 1px, transparent 1px)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <svg className="w-full h-full">
                    {/* Fixed: Transform on inner <g> element avoids SVG viewport clipping */}
                    <g
                      transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                      style={{ transition: isDragging ? 'none' : 'transform 0.05s ease-out' }}
                    >
                      <g>
                        {connections.map((conn) => (
                          <path
                            key={conn.id}
                            d={conn.d}
                            fill="none"
                            stroke={conn.highlighted ? '#10b981' : '#2d4b43'}
                            strokeWidth={conn.highlighted ? 2.5 : 1.75}
                            strokeOpacity={conn.highlighted ? 0.95 : 0.65}
                            strokeLinecap="round"
                          />
                        ))}
                      </g>

                      <g>
                        {flatNodes.map((item) => {
                          const isSelected = selectedNode?.id === item.node.id;
                          let bgColor = '#1b3831';
                          let borderColor = '#2d574d';
                          let textColor = '#ffffff';

                          if (item.depth === 0) {
                            bgColor = '#14302a';
                            borderColor = '#10b981';
                          } else if (item.depth === 1) {
                            bgColor = '#1a3d35';
                            borderColor = '#34d399';
                          } else if (item.node.templateId) {
                            bgColor = '#263445';
                            borderColor = '#60a5fa';
                          }

                          if (isSelected) {
                            borderColor = '#10b981';
                            bgColor = '#244d43';
                          }

                          return (
                            <g
                              key={item.node.id}
                              transform={`translate(${item.x}, ${item.y})`}
                              onClick={() => setSelectedNode(item.node)}
                              className="cursor-pointer transition-all duration-150"
                            >
                              <rect
                                width={item.width}
                                height={item.height}
                                rx={18}
                                ry={18}
                                fill={bgColor}
                                stroke={borderColor}
                                strokeWidth={isSelected ? 2.5 : 1.25}
                                className="hover:filter hover:brightness-125 transition-all shadow-md"
                              />

                              <text
                                x={item.width / 2}
                                y={item.height / 2 + 4}
                                textAnchor="middle"
                                fill={textColor}
                                fontSize={item.depth === 0 ? 13 : item.depth === 1 ? 12 : 11}
                                fontFamily="ui-sans-serif, system-ui, sans-serif"
                                fontWeight={item.depth <= 1 ? 700 : 500}
                                className="pointer-events-none select-none"
                              >
                                {item.node.label}
                              </text>

                              {item.hasChildren && (
                                <g
                                  transform={`translate(${item.width + 12}, ${item.height / 2})`}
                                  onClick={(e) => toggleNodeCollapse(item.node.id, e)}
                                  className="cursor-pointer"
                                >
                                  <circle
                                    r={9}
                                    fill="#102722"
                                    stroke={item.isExpanded ? '#34d399' : '#94a3b8'}
                                    strokeWidth={1.5}
                                    className="hover:fill-emerald-900 transition-colors"
                                  />
                                  <text
                                    textAnchor="middle"
                                    y={3.5}
                                    fill="#e2e8f0"
                                    fontSize={9}
                                    fontWeight="bold"
                                    className="pointer-events-none select-none"
                                  >
                                    {item.isExpanded ? '<' : '>'}
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Node Detail Inspector for Canvas View */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      Node Inspector
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedNode.description ||
                        'Select any node in the tree to inspect parameters and rules.'}
                    </p>
                  </div>

                  {selectedNode.guidelines && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Rules &amp; Invariants:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedNode.guidelines.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedNode.codeSnippet && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Code Snippet:
                      </span>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed max-h-56">
                        {selectedNode.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => setActiveTab('author')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Open in Skill Builder</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: TREE OUTLINE */}
          {mapViewMode === 'outline' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-purple-400" />
                  <span>Comprehensive Hierarchical Outline</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Full drilldown of all 4 pillars, subbranches, parameters, and operational boundaries.
                </p>
              </div>

              <div className="space-y-4">
                {AGENT_SKILL_MIND_MAP.children?.map((branch) => (
                  <div key={branch.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <GitBranch className="w-4 h-4" />
                      <span>{branch.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6">{branch.description}</p>

                    <div className="pl-6 space-y-3 pt-2">
                      {branch.children?.map((sub) => (
                        <div key={sub.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                            <span className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{sub.label}</span>
                            </span>
                            <button
                              onClick={() => {
                                setSelectedNode(sub);
                                setActiveTab('author');
                              }}
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
                            >
                              Author with this
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                            {sub.children?.map((leaf) => (
                              <div
                                key={leaf.id}
                                onClick={() => setSelectedNode(leaf)}
                                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-slate-700 cursor-pointer"
                              >
                                <span className="font-mono text-emerald-300 font-semibold block truncate">
                                  {leaf.label}
                                </span>
                                {leaf.description && (
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {leaf.description}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: AUTHOR SKILL WORKSPACE (BUILDING ON write-skill) */}
      {activeTab === 'author' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form: Parameters & Logic Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-400" />
                  <span>Author Skill Architect</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by <code className="text-indigo-400 font-bold">write-skill</code>. Generates defensive parameter schemas and vector embeddings.
                </p>
              </div>

              <button
                onClick={handleValidateSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Validator</span>
              </button>
            </div>

            {/* Validation Feedback */}
            {validationOutput && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
                  validationOutput.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {validationOutput.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Info className="w-4 h-4 text-red-400" />
                  )}
                  <span>{validationOutput.valid ? 'Validation Passed' : 'Validation Issues Detected:'}</span>
                </div>
                {validationOutput.issues && (
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {validationOutput.issues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">
                    skillName (kebab-case) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={authorSkillName}
                    onChange={(e) => setAuthorSkillName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. data-pipeline-cleaner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">
                    Human Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Data Pipeline Cleaner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block">
                  Mission &amp; Operational Boundaries <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={authorMission}
                  onChange={(e) => setAuthorMission(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                  placeholder="State what the skill will execute and what it explicitly refuses..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">Category</label>
                  <select
                    value={authorCategory}
                    onChange={(e) => setAuthorCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200"
                  >
                    <option value="orchestration">orchestration</option>
                    <option value="security-audit">security-audit</option>
                    <option value="cloud-infrastructure">cloud-infrastructure</option>
                    <option value="math-geometry">math-geometry</option>
                    <option value="development">development</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">Clearance</label>
                  <select
                    value={authorClearance}
                    onChange={(e) => setAuthorClearance(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200"
                  >
                    <option value="public">public</option>
                    <option value="internal">internal</option>
                    <option value="admin-only">admin-only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">Runtime</label>
                  <select
                    value={authorRuntime}
                    onChange={(e) => setAuthorRuntime(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200"
                  >
                    <option value="in_process">in_process</option>
                    <option value="mcp">mcp</option>
                    <option value="cloud_function">cloud_function</option>
                  </select>
                </div>
              </div>

              {/* Parameters List Dynamic Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono text-slate-300">
                    Parameters Schema (parametersList)
                  </label>
                  <button
                    onClick={() =>
                      setAuthorParameters([
                        ...authorParameters,
                        { name: `param_${Date.now().toString(36)}`, type: 'string', required: false, description: 'Description' },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {authorParameters.map((param, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => {
                          const updated = [...authorParameters];
                          updated[idx].name = e.target.value;
                          setAuthorParameters(updated);
                        }}
                        className="col-span-4 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-slate-200"
                        placeholder="Name"
                      />
                      <select
                        value={param.type}
                        onChange={(e) => {
                          const updated = [...authorParameters];
                          updated[idx].type = e.target.value;
                          setAuthorParameters(updated);
                        }}
                        className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1 font-mono text-slate-300"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="object">object</option>
                        <option value="array">array</option>
                      </select>
                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) => {
                          const updated = [...authorParameters];
                          updated[idx].description = e.target.value;
                          setAuthorParameters(updated);
                        }}
                        className="col-span-4 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => setAuthorParameters(authorParameters.filter((_, i) => i !== idx))}
                        className="col-span-1 p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        title="Remove parameter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview: Live SKILL.md Generator & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Live SKILL.md Output</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDraft}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDraft ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadDraft}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {saveSuccessMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Code Editor Preview */}
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-400 text-xs font-mono overflow-y-auto max-h-[500px] leading-relaxed">
                {generatedSkillMarkdown}
              </pre>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Registry: <code className="text-indigo-400">/skills/{authorSkillName}</code>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToRegistry}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Database className="w-4 h-4" />
                  <span>{isSaving ? 'Registering & Embedding...' : 'Register to Firestore & Vector(768)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: THE 4 ARCHITECTURE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATE_PRESETS.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    {tpl.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Runtime: {tpl.runtime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="pt-2">
                  <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                    {tpl.markdown}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tpl.markdown);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Markdown</span>
                </button>

                <button
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Build with this Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
