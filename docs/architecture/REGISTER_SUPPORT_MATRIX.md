# Writing OS — Register Support Matrix

**Date:** 2026-08-22  
**Current Evidence:** FICTION only

---

## Register Support Matrix

| Mode | Register | Evidence Status | Current Corpus | Implementation | Notes |
|---|---|---|---|---|---|
| FICTION | Novel (generic) | **DEMONSTRATED** | 59 cases (golden-v1) | Existing (v1 Core + FICTION mode) | All experiments used generic fiction; no novel-specific pack |
| FICTION | Short Story | PARTIAL / PROPOSED | No | Not specialized | Core would work; no short-story-specific rules |
| FICTION | Screenplay | PROPOSED | No | Not specialized | Would need format-specific rules |
| FICTION | Other Narrative | PROPOSED | No | Not specialized | Catch-all |
| NONFICTION | Academic | **LIMITED** | 0 cases | Smoke test only | 4.1 nonfiction smoke test: paraphrase overblocked |
| NONFICTION | Technical | PROPOSED | No | Not validated | |
| NONFICTION | Business/Professional | PROPOSED | No | Not validated | |
| NONFICTION | Journalistic/Informational | PROPOSED | No | Not validated | |
| NONFICTION | Other | PROPOSED | No | Not validated | |

## Evidence Legend

| Status | Meaning |
|---|---|
| DEMONSTRATED | Directly exercised in controlled experiments with live LLM execution |
| LIMITED | Smoke-tested but not formally validated |
| PARTIAL / PROPOSED | Architecture supports it but no register-specific validation |
| PROPOSED | Architectural design only; no implementation or evidence |

## Mode/Register Registry

```json
{
  "modes": {
    "FICTION": {
      "status": "DEMONSTRATED",
      "evidenceExperiments": ["iteration-4-3b", "writing-os-v1", "writing-os-v1-1", "r6"],
      "goldenCorpusCases": 59,
      "registers": [
        {"id": "NOVEL", "status": "DEMONSTRATED (generic)", "corpusCases": 59},
        {"id": "SHORT_STORY", "status": "PROPOSED", "corpusCases": 0},
        {"id": "SCREENPLAY", "status": "PROPOSED", "corpusCases": 0},
        {"id": "OTHER_NARRATIVE", "status": "PROPOSED", "corpusCases": 0}
      ]
    },
    "NONFICTION": {
      "status": "PROPOSED",
      "evidenceExperiments": ["iteration-4-nonfiction-smoke-test"],
      "goldenCorpusCases": 0,
      "registers": [
        {"id": "ACADEMIC", "status": "LIMITED (smoke test)", "corpusCases": 0},
        {"id": "TECHNICAL", "status": "PROPOSED", "corpusCases": 0},
        {"id": "BUSINESS_PROFESSIONAL", "status": "PROPOSED", "corpusCases": 0},
        {"id": "JOURNALISTIC_INFORMATIONAL", "status": "PROPOSED", "corpusCases": 0},
        {"id": "OTHER", "status": "PROPOSED", "corpusCases": 0}
      ]
    }
  }
}
```

## What "DEMONSTRATED (generic)" Means for FICTION/NOVEL

The 59 Golden Corpus cases are fiction under LICENSED_FICTION policy. They use a generic fiction setup (Maya/Marcus clinic embezzlement scenario) that is not specifically novel-formatted, short-story-formatted, or screenplay-formatted. The Core + FICTION mode has been demonstrated; specific Register Pack behavior has not.

## What "LIMITED (smoke test)" Means for NONFICTION/ACADEMIC

The Iteration 4 nonfiction smoke test ran 2 cases (valid revision + invalid revision with invented specifics) under SOURCE_CONSTRAINED. The invalid revision was correctly rejected (invented Dr. Marsh, March 15, $2.3B). The valid revision was rejected due to paraphrase overblocking ("medical centers" ≠ "hospitals"). This is insufficient evidence for validation.
