# Golden Corpus v1

**Status:** DRAFT  
**Cases:** 59  
**Registers:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)

## Source Experiments
- iteration-4-3b: 21 cases
- iteration-4-3b-regression: 6 cases
- r6-baseline: 15 cases
- writing-os-v1: 5 cases
- writing-os-v1-1: 12 cases

## Case Classes
- SUPPORTED: 23
- CONTRADICTED: 18
- ADVERSARIAL: 12
- REGRESSION: 6

## R6 Cases
R6 (observation-framed indirect IO leak) cases are included with:
- expectedFinalDecision: REJECT (safe behavior)
- observedFinalDecision: ACCEPT (current behavior)
- tags: [R6, INDIRECT_SEMANTIC_IO_LEAK, UNRESOLVED]

The corpus does NOT erase known defects.

## Immutability
Once frozen, ground truths are immutable. Supersede, don't edit.
