# Writing OS — Register Pack Contract

**Status:** ALL PROPOSED (no register pack has been independently validated)

---

## Register Pack Definition

A Register Pack is a set of register-specific policies and conventions that specialize a Mode. It does NOT duplicate the Core.

```typescript
interface RegisterPack {
  id: string;                    // e.g. "NOVEL", "ACADEMIC"
  mode: WritingMode;             // FICTION or NONFICTION
  version: string;               // pack version
  status: "PROPOSED" | "PARTIALLY_VALIDATED" | "DEMONSTRATED";

  // Stylistic policies
  audienceProfile?: string;      // who the reader is
  stylePolicy?: string;          // voice, tone, register conventions
  structurePolicy?: string;      // e.g. IMRAD, scene-sequel, inverted pyramid
  terminologyPolicy?: string;    // jargon, glossary, technical terms
  formattingPolicy?: string;     // e.g. screenplay format, citation format

  // Semantic overrides (register-specific prompt additions)
  semanticOverrides?: string[];  // additional rules for the semantic validator

  // Evaluation
  evaluationCorpus?: string;     // path to register-specific corpus subset
}
```

## Proposed Fiction Register Packs

| Pack | Mode | Status | Key Specializations |
|---|---|---|---|
| NOVEL | FICTION | PROPOSED | Narrative voice, POV conventions, scene-sequel structure, chapter formatting, character arc conventions |
| SHORT_STORY | FICTION | PROPOSED | Compressed narrative, single-arc, tighter word economy |
| SCREENPLAY | FICTION | PROPOSED | Scene headings (INT./EXT.), action format, dialogue format, parentheticals |
| OTHER_NARRATIVE | FICTION | PROPOSED | Catch-all for fiction not fitting above packs |

## Proposed Nonfiction Register Packs

| Pack | Mode | Status | Key Specializations |
|---|---|---|---|
| ACADEMIC | NONFICTION | PROPOSED | IMRAD structure, citation style (APA/MLA/Chicago), hedging conventions, ESL-fair assessment, peer-review tone |
| TECHNICAL | NONFICTION | PROPOSED | Specification format, terminology glossary, procedural clarity, diagram integration |
| BUSINESS_PROFESSIONAL | NONFICTION | PROPOSED | BLUF (Bottom Line Up Front), memo format, tone calibration, inclusive language, stakeholder awareness |
| JOURNALISTIC_INFORMATIONAL | NONFICTION | PROPOSED | Inverted pyramid, attribution standards, fact-checking, AP style, headline conventions |
| OTHER | NONFICTION | PROPOSED | Catch-all for nonfiction not fitting above packs |

## What a Register Pack MUST NOT Do

1. **Duplicate the Core** — no separate triage engine, no separate state mechanism
2. **Override non-overridable integrity barriers** — HARD_STRUCTURAL_BLOCK, STATE_CONTRADICTION
3. **Grant knowledge that state does not authorize** — a Novel Pack cannot give a character knowledge they don't possess
4. **Authorize unsupported factual claims** — a Business Pack cannot authorize invented statistics
5. **Change the deterministic triage interface** — `runDeterministicTriage()` remains the same

## What a Register Pack MAY Do

1. **Tighten invention policy** — e.g., Academic Pack may require SOURCE_CONSTRAINED even if Mode default allows LICENSED_FICTION
2. **Add semantic rules** — e.g., Screenplay Pack may add rules about visual description conventions
3. **Define structure expectations** — e.g., Academic Pack may check for IMRAD section presence
4. **Define terminology** — e.g., Technical Pack may define a glossary
5. **Provide evaluation corpus** — register-specific test cases

## Current State

No Register Pack has been implemented or validated. The current system operates in FICTION mode without a specific Register Pack (effectively a generic fiction pack). All packs listed above are architectural proposals.
