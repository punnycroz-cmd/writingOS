// tests/runtime/mandatory-pipeline.test.ts
// Unit & Integration Tests for Mandatory Dual-Layer Pipeline Orchestrator (v3.2)

import { describe, test, expect } from "bun:test";
import { MandatoryPipelineOrchestrator, PipelineQuarantineException } from "../../src/runtime/pipeline-orchestrator";
import { WritingOSRuntime } from "../../src/runtime/writing-os-runtime";

describe("Writing OS v3.2 — Mandatory Dual-Layer Pipeline & Adversarial Quarantine", () => {
  const rawChapterWithFlaws = `
# CHAPTER 1: THE WAKING
The overhead fluorescent strips hummed.
Every nerve ending along the perimeter of his skull felt raw, stripped of myelin.
He only knew four letters.
*M—A—R—E—N.*
Hanging from the stainless-steel footboard was a physical clipboard.
Inside was a single sheet of heavy bond paper stamped in crimson ink:
> SUBJECT ZERO — COGNITIVE LAYER 4 CANDIDATE
> HANDLING DIRECTIVE: DO NOT INTERCEPT.
His calf muscles trembled with atrophy, but he stood up instantly and dressed in a navy măng-tô coat, walking out into the corridor without pain.
He had four letters in his head.
`.trim();

  test("Stage 1 & 2: Accurately audits raw draft and generates concrete remediation directives", () => {
    const audit = MandatoryPipelineOrchestrator.auditManuscript(1, rawChapterWithFlaws);
    expect(audit.passedBaseline).toBe(false);
    expect(audit.grammarViolations.some(g => g.type === "LOAN_WORD")).toBe(true);

    const plan = MandatoryPipelineOrchestrator.generateRemediationPlan(audit);
    expect(plan.totalDirectives).toBeGreaterThan(0);
    expect(plan.directives.some(d => d.remediationRule === "CORRECT_ARITHMETIC")).toBe(true);
    expect(plan.directives.some(d => d.remediationRule === "ENFORCE_OPSEC")).toBe(true);
  });

  test("Stage 4 Quarantine: Rejects candidate with broken sentence regressions", () => {
    const brokenRegressionDraft = `
# CHAPTER 1: THE WAKING
The overhead fluorescent strips hummed.
Every nerve ending along the perimeter of his raw, stripped of myelin.
He only knew five letters.
*M—A—R—E—N.*
On the active datapad screen, a directive glowed: DO NOT INTERCEPT.
Elias forced his legs to stand, gripping the bedrail as dizziness hit him.
He put on a navy canvas overcoat.
`.trim();

    const audit = MandatoryPipelineOrchestrator.auditManuscript(1, rawChapterWithFlaws);
    const verification = MandatoryPipelineOrchestrator.quarantineAndVerify(1, rawChapterWithFlaws, brokenRegressionDraft, audit);

    expect(verification.passed).toBe(false);
    expect(verification.status).toBe("REJECTED");
    expect(verification.newRegressions.some(r => r.type === "CORRUPTED_PREDICATE")).toBe(true);
  });

  test("Stage 4 Quarantine: Rejects candidate with unmitigated arithmetic error", () => {
    const arithmeticFlawedDraft = `
# CHAPTER 1: THE WAKING
The overhead fluorescent strips hummed.
Every nerve along his skull thrummed with static.
He only knew four letters.
*M—A—R—E—N.*
On the active datapad screen, a directive glowed: DO NOT INTERCEPT.
Elias forced his legs to stand, gripping the bedrail as dizziness hit him.
He put on a navy canvas overcoat.
`.trim();

    const audit = MandatoryPipelineOrchestrator.auditManuscript(1, rawChapterWithFlaws);
    const verification = MandatoryPipelineOrchestrator.quarantineAndVerify(1, rawChapterWithFlaws, arithmeticFlawedDraft, audit);

    expect(verification.passed).toBe(false);
    expect(verification.unresolvedViolations.some(v => v.includes("Arithmetic mismatch"))).toBe(true);
  });

  test("Stage 4 Quarantine: Throws PipelineQuarantineException when running executePipeline on non-compliant candidate", () => {
    expect(() => {
      MandatoryPipelineOrchestrator.executePipeline(1, rawChapterWithFlaws, () => {
        return "the air leave his lungs. He only knew four letters. M-A-R-E-N.";
      });
    }).toThrow(PipelineQuarantineException);
  });

  test("Stage 5 Delivery: Fully verifies clean, compliant rewrite and generates tracked changes bundle", () => {
    const pristineDraft = `
# CHAPTER 1: THE WAKING
The overhead fluorescent strips hummed in the Halloway hospital ward.
Every nerve along his skull thrummed with high-frequency static after an eleven-day coma.
His memory was wiped clean, but he only knew five letters.
*M—A—R—E—N.*
Dr. Bradley left his docking datapad on the medication cart.
On the active screen, a surveillance clearance header glowed against the dark interface.
Elias swung his legs over the mattress; his knees buckled and dizziness surged, but he caught the iron rail.
He put on a heavy navy canvas overcoat.
He pushed through the heavy doors into the corridor.
`.trim();

    const bundle = MandatoryPipelineOrchestrator.executePipeline(1, rawChapterWithFlaws, () => pristineDraft);

    expect(bundle.verificationResult.passed).toBe(true);
    expect(bundle.verificationResult.status).toBe("ACCEPTED");
    expect(bundle.verifiedText).toBe(pristineDraft);
    expect(bundle.trackedChangesHtml).toContain("Tracked Changes");
    expect(bundle.globalFactUpdates["FACT_MAREN_LENGTH"]).toBeDefined();
  });

  test("WritingOSRuntime: Integrates Mandatory Pipeline cleanly", () => {
    const runtime = new WritingOSRuntime();
    const audit = runtime.auditManuscript(1, rawChapterWithFlaws);
    expect(audit.passedBaseline).toBe(false);
  });
});
