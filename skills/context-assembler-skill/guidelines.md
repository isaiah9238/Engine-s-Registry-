# Contextual Prompt Assembler

## Description & Mission
Assembles a deterministic LLM prompt by layering **Procedural Rules** (System), **Semantic Facts** (Memory), and **Active Task** (User). This enforces system constraints while binding episodic context.

## Operational Logic (The Layering Standard)
1. **Layer 1 (Procedural)**: Invariant system rules (clearance, styling, response invariants).
2. **Layer 2 (Semantic)**: Retrieved facts and vector matches from `multi-tier-agent-memory`.
3. **Layer 3 (Working)**: Current user task and active conversation context.
