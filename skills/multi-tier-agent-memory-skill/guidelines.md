# Multi-Tier Agent Memory & Semantic Vector Indexer

## Description & Mission
Provides deterministic, context-isolated retrieval across three cognitive memory tiers:
1. **Working Memory**: Session-specific turn history and immediate context buffer.
2. **Semantic Memory**: Persistent 768-D vector indexing in Firestore using `text-embedding-004`.
3. **Procedural Memory**: Immutable system-level rule injection and operational invariants.

## Input Contract
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `operation` | `string` | Yes | `store`, `recall`, or `assemble_context` |
| `content` | `string` | Yes | Input payload to embed, query, or layer |
| `category` | `string` | No | Taxonomy filter: `demographic`, `preference`, `project`, `rule` |
| `limit` | `number` | No | Maximum vector neighbors returned (default: 5) |

## Execution Directives
- **Store**: Generate 768-D vector representation with `text-embedding-004`, write atomic document to `memories` collection with Firestore server timestamp.
- **Recall**: Calculate embedding for `content`, execute `findNearest` vector search using `COSINE` distance against the index.
- **Assemble Context**: Layer procedural rules first, inject vector-retrieved semantic facts second, and append working conversation turns last.
