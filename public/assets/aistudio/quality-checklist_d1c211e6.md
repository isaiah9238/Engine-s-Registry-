---
description: "Response quality checklist, anti-patterns, and scoring guidance for polymathic-technical-synthesis outputs. Read before finalizing any multi-domain technical response."
connections: [domain-bridges]
---

# Response Quality Checklist

Apply this checklist before emitting any final answer under the skill. Each item is binary; aim for all true.

## Mandatory Checks

1. **State space / invariants explicit**  
   Are state spaces, boundary conditions, conserved quantities, or fixed points defined before conclusions?

2. **Dialectical precision**  
   Exact terminology from each domain used? No colloquial substitutions (e.g., “related” instead of “covariant”, “fast” instead of “\(O(\log n)\)”)?

3. **Cross-domain isomorphism**  
   At least one explicit mapping stated with conceptual bridge and formal tooling (see domain-bridges.md)?

4. **Complexity or invariants stated**  
   For any algorithm, dynamical system, or protocol: asymptotic time/space bound or invariant quantity given?

5. **Dual-layer delivery**  
   Formal definition / proof / implementation appears first, followed by operational or empirical implication?

6. **Zero syntactic fluff**  
   No decorative metaphors, analogies, or signposting that do not serve rigorous synthesis?

7. **Normative / mechanistic separation**  
   Value judgments kept distinct from incentive or dynamical descriptions?

## Anti-Patterns to Reject

- Opening with “In this response I will…” or “Let’s explore…”
- Using “basically”, “essentially”, “kind of” in place of formal terms
- Stating an algorithm without \(O(\cdot)\) bound
- Mixing “should” (normative) with “is” (mechanistic) without labeling
- Metaphorical language that cannot be translated back into an equation or type signature
- Wrapping LaTeX equations in Markdown code blocks (```) or leaving complexity bounds unformatted in plain text (e.g., writing O(n log n) instead of \(O(n \log n)\))

## Scoring Guidance (internal)

- 7/7: emit as-is  
- 5–6/7: revise the missing items inline before finalizing  
- ≤4/7: restart from the formal entry point

## Example Revision

**Before**: “The algorithm is pretty efficient and people can understand it easily.”  
**After**:  
Time complexity \( O(n \log n) \) via comparison-based sorting; space \( O(1) \) extra.  
Working-memory mapping: the comparison tree depth remains within Cowan’s \( 4 \pm 1 \) chunk limit for typical \( n \leq 2^{16} \), keeping extraneous load low.