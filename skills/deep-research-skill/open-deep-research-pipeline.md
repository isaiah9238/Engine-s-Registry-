---
name: open-deep-research-pipeline
title: "Open Deep Research Multi-Agent Orchestration Engine"
description: "Orchestrates an open-source multi-agent research pipeline using 4 specialized sub-agent roles (Planner/Scope, Coordinator/Supervisor, Execution Sub-Agent, and Publisher/Writer) to execute parallelized multi-hop research, context isolation, and cited report synthesis."
version: 1.1.0
category: orchestration
genkit-managed: false
priority: 1
requiresHumanReview: false
---

# Open Deep Research Multi-Agent Orchestration Engine

## Overview & Mission

The `open-deep-research-pipeline` skill equips AI assistants with a structured 4-role multi-agent architecture for autonomous, multi-step research. By isolating sub-topic context windows across parallel research threads, this pipeline prevents token bloat and context clash while ensuring all claims trace directly back to verified sources.

---

## The 4 Sub-Agent Roles

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PLANNER / SCOPE AGENT                                       │
│     • Clarifies user intent & builds the Research Brief          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. COORDINATOR / SUPERVISOR AGENT                              │
│     • Decomposes brief into parallel sub-topics                 │
│     • Spawns sub-agents & checks for information gaps           │
│     • Resolves contradictions between sources                   │
└─────────────────────────────────────────────────────────────────┘
             │                                   │
             ▼                                   ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│  3a. EXECUTION SUB-AGENT  │       │  3b. EXECUTION SUB-AGENT  │
│  (Topic A: Tool Loop)     │       │  (Topic B: Tool Loop)     │
└───────────────────────────┘       └───────────────────────────┘
             │                                   │
             └─────────────────┬─────────────────┘
                               │ (Clean Summaries)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. PUBLISHER / WRITER AGENT                                    │
│     • Synthesizes single-shot long-form report with citations   │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Overview Table (8.5" Page Width Compliant)

| Stage | Agent Role | Core Responsibilities | Inputs & Outputs |
| :--- | :--- | :--- | :--- |
| **1** | **Planner / Scope Agent** | • Clarifies user intent and research goals<br>• Builds the foundational **Research Brief** | **Input:** User Prompt<br>**Output:** Research Brief |
| **2** | **Coordinator / Supervisor Agent** | • Decomposes brief into parallel sub-topics<br>• Spawns sub-agents & monitors research gaps<br>• Identifies and resolves source contradictions | **Input:** Research Brief<br>**Output:** Sub-topic Tasks & Aggregated Evidence |
| **3a / 3b** | **Execution Sub-Agents** *(Parallel)* | • Execute iterative search tool loops (web/RAG)<br>• Filter raw scraped text to prevent token bloat | **Input:** Sub-topic Assignment<br>**Output:** Clean Evidence Summaries |
| **4** | **Publisher / Writer Agent** | • Assembles cleaned findings from all sub-agents<br>• Synthesizes single-shot long-form report with citations | **Input:** Aggregated Evidence<br>**Output:** Final Cited Report |

---

### Detailed Sub-Agent Specifications

#### 1. Planner / Scope Agent
* **Primary Task**: Interactively clarifies ambiguous research prompts with the user and synthesizes a focused **Research Brief**.
* **Operational Boundary**: Translates verbose user interactions into a single North Star document defining research goals, required depth, and explicitly excluded topics.

#### 2. Coordinator / Supervisor Agent
* **Primary Task**: Decomposes the Research Brief into parallel sub-topics, delegates tasks to Execution Sub-Agents, and evaluates returning results.
* **Operational Boundary**: Evaluates research coverage against the brief. If gaps or source contradictions remain, it spawns additional targeted sub-agents; once coverage is complete, it hands off clean evidence to the Publisher.

#### 3. Execution Sub-Agents (Parallel Workers)
* **Primary Task**: Runs iterative, multi-hop search tool loops (web search, document scraping, local RAG, MCP tools) for a single assigned sub-topic.
* **Operational Boundary**: Maintains strict **Context Isolation**. Cleans and prunes raw scraped text (removing failed tool calls and irrelevant HTML) before returning a concise, source-cited summary to the Supervisor.

#### 4. Publisher / Writer Agent
* **Primary Task**: Takes the aggregated, cleaned evidence from all sub-agents and produces a single-shot, long-form research report.
* **Operational Boundary**: Writes cohesive Markdown reports with inline bracketed citations (`[Source, Section]`). Section writing is performed in one shot (not in parallel) to maintain narrative flow and eliminate disjointed formatting.

---

## Prerequisites

1. Verify access to web search tools, local RAG vector databases, or Model Context Protocol (MCP) data providers.
2. Confirm the host environment supports parallel task execution (e.g., LangGraph, AutoGen, or async event loops).

---

## Usage Principles & Operational Rules

1. **Context Isolation**: Never mix tool-call context across unrelated sub-topics in a single sub-agent context window. Each Execution Sub-Agent must focus strictly on its assigned query thread.
2. **Sub-Agent Context Pruning**: Execution Sub-Agents must invoke an intermediate LLM cleaning pass to summarize raw web text before returning findings to the Supervisor, preventing token bloat (up to 15x token inflation).
3. **One-Shot Report Writing**: Restrict multi-agent parallelization to the *research phase*. Always write the final report in a single pass to ensure consistent tone, structure, and seamless cross-section comparisons.
4. **Contradiction Resolution**: When two sources provide conflicting data (e.g., differing financial metrics or dates), the Supervisor must highlight the discrepancy explicitly rather than averaging numbers away.

---

## Step-by-Step Workflow Execution

### Phase 1: Scoping & Brief Generation
1. Check query for ambiguity across **Scope**, **Depth**, and **Source Types**.
2. Generate a 1-page **Research Brief** outlining:
   * Target Objectives & Key Questions
   * Mandatory Source Types (e.g., Peer-reviewed papers, SEC filings, official documentation)
   * Verification Criteria

### Phase 2: Parallel Research & Reflection
1. The **Supervisor Agent** reviews the Brief and spawns $N$ parallel **Execution Sub-Agents**.
2. Each Sub-Agent executes a **Plan $\rightarrow$ Act $\rightarrow$ Observe** loop using configured tools (Tavily, Bing, Local RAG, MCP).
3. Sub-Agents summarize their findings, attach URL/document metadata, and return cleaned summaries to the Supervisor.
4. The Supervisor evaluates total coverage. If key questions in the Brief remain unanswered, it triggers a second, narrower research iteration.

### Phase 3: Single-Shot Report Synthesis
1. Once the Supervisor approves research coverage, the **Publisher Agent** receives the complete evidence map.
2. Generates an exhaustive report (2,000+ words) formatted with:
   * Executive Summary & Key Findings
   * Comparative Synthesis & Sub-topic Deep Dives
   * Explicit Inline Citations (`[Source Name, Year]`)
   * Source Provenance Table

---

## Examples & Walkthroughs

### Example 1: Multi-Entity Competitive Analysis
* **User Query**: "Compare the AI safety frameworks and technical alignment approaches of OpenAI, Anthropic, and Google DeepMind."
* **Planner Action**: Creates a Research Brief specifying three parallel research tracks (one per lab) plus a comparative synthesis scope.
* **Supervisor Action**: Spawns 3 Execution Sub-Agents simultaneously.
  * *Sub-Agent 1*: Focuses strictly on OpenAI's recursive reward modeling and o3 alignment.
  * *Sub-Agent 2*: Focuses strictly on Anthropic's Constitutional AI and mechanistic interpretability.
  * *Sub-Agent 3*: Focuses strictly on DeepMind's sociotechnical safety and frontier evaluations.
* **Outcome**: Context windows stay clean; Sub-Agents return isolated findings. Publisher Agent synthesizes a unified comparative matrix with 100% cited facts.

---

## Reference Specifications
* `LangChain Open Deep Research` — Multi-agent supervisor & context isolation patterns.
* `GPT Researcher Specification` — Parallelized crawler work, Jev context filtering, and report publishing.
* `Search Intelligen Architecture` — 3-layer hierarchical agent design and perception-action loops.
