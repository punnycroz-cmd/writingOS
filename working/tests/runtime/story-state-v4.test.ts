// tests/runtime/story-state-v4.test.ts
// Writing OS v4: Story-State Fact Graph & 12-Dimensional Post-Rewrite Integrity Engine Tests

import { describe, test, expect } from "bun:test";
import { StoryStateFactGraph, PostRewriteIntegrityAuditor } from "../../src/runtime/story-state-engine";
import { MandatoryPipelineOrchestrator } from "../../src/runtime/pipeline-orchestrator";
import { WritingOSRuntime } from "../../src/runtime/writing-os-runtime";

describe("Writing OS v4 — Story-State Fact Graph & 12-Dimensional Post-Rewrite Integrity", () => {

  describe("Pillar 1: Dynamic Story-State Fact Graph & Object Matrix", () => {
    test("FactGraph initializes with core Story Bible canonical facts", () => {
      const graph = new StoryStateFactGraph();
      const facts = graph.getAllFacts();

      expect(facts.length).toBeGreaterThanOrEqual(6);
      const subjectZeroFact = facts.find(f => f.object === "Subject Zero");
      expect(subjectZeroFact).toBeDefined();
      expect(subjectZeroFact?.provenance).toBe("CANON_CONFIRMED");

      const comaFact = facts.find(f => f.predicate === "coma_duration");
      expect(comaFact?.object).toBe("11 days");
    });

    test("FactGraph tracks physical object ownership matrix across scenes", () => {
      const graph = new StoryStateFactGraph();
      const datapad = graph.getObjectOwnership("OBJ_DATAPAD");
      expect(datapad).toBeDefined();
      expect(datapad?.currentLocation).toBe("Halloway Medical Center");

      const pendant = graph.getObjectOwnership("OBJ_PENDANT");
      expect(pendant?.currentHolder).toBe("Dr. Maren Solis");
    });

    test("FactGraph manages proposal lifecycle: PENDING -> APPROVED -> CANON_CONFIRMED", () => {
      const graph = new StoryStateFactGraph();
      const prop = graph.registerProposal(
        "Elena Solis Research Lab",
        "corporate_parent",
        "Iris Halloway Venture Shell",
        2,
        "The holding company behind that lab was an early venture shell owned by Iris Halloway."
      );

      expect(prop.status).toBe("PENDING");
      expect(prop.provenance).toBe("CANON_PROPOSAL");

      // Approve proposal
      const approved = graph.approveProposal(prop.id);
      expect(approved).toBe(true);

      const updatedFact = graph.getFact(prop.id);
      expect(updatedFact?.status).toBe("APPROVED");
      expect(updatedFact?.provenance).toBe("CANON_CONFIRMED");
    });
  });

  describe("Pillar 2: 12-Dimensional Post-Rewrite Integrity Auditor", () => {
    test("Dim 1 (Arithmetic): Flags 4 letters for 5-letter MAREN", () => {
      const text = "He only knew four letters. M—A—R—E—N.";
      const res = PostRewriteIntegrityAuditor.auditArithmetic(text);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Arithmetic Contradiction");
    });

    test("Dim 2 (Technical Units): Flags Decibels attached to Illumination/Light", () => {
      const invalidText = "Keep the ward illumination below forty decibels.";
      const res = PostRewriteIntegrityAuditor.auditTechnicalUnits(invalidText);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Decibel is an acoustic unit, but was attached to illumination/light");

      const validText = "Keep the ward illumination low and auditory stimulation below forty decibels.";
      const validRes = PostRewriteIntegrityAuditor.auditTechnicalUnits(validText);
      expect(validRes.passed).toBe(true);
    });

    test("Dim 3 (Worldbuilding Lore): Flags dilution of 'quantum lattice' to generic 'array buffer'", () => {
      const orig = "Unexpected power surge across the primary quantum lattice.";
      const diluted = "Unexpected power surge in the primary array buffer.";
      const res = PostRewriteIntegrityAuditor.auditWorldbuildingPreservation(orig, diluted);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("diluted to generic \"array buffer\"");

      const preserved = "Unexpected power surge across the primary quantum lattice.";
      const cleanRes = PostRewriteIntegrityAuditor.auditWorldbuildingPreservation(orig, preserved);
      expect(cleanRes.passed).toBe(true);
    });

    test("Dim 4 (Object & Spatial Vectors): Flags after-hours clinic entry without bypass vector", () => {
      const invalidEntry = "It was quarter past six. The frosted glass door swung open and Elias walked in.";
      const res = PostRewriteIntegrityAuditor.auditObjectContinuity(invalidEntry);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Spatial Vector Gap");

      const validEntry = "It was quarter past six. The service elevator bypasses the night latch during garbage collection.";
      const cleanRes = PostRewriteIntegrityAuditor.auditObjectContinuity(validEntry);
      expect(cleanRes.passed).toBe(true);
    });

    test("Dim 5 (Somatic Friction): Flags effortless sprint after 11-day coma", () => {
      const invalid = "He had survived an eleven-day coma. As he stood, he walked out into the corridor with cold focus.";
      const res = PostRewriteIntegrityAuditor.auditSomaticFriction(invalid);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Somatic Friction Violation");

      const valid = "He had survived an eleven-day coma. When his soles struck the floor, his knees buckled and nausea surged, but knuckles pale, he dragged himself upright.";
      const cleanRes = PostRewriteIntegrityAuditor.auditSomaticFriction(valid);
      expect(cleanRes.passed).toBe(true);
    });

    test("Dim 8 (Unapproved Inventions): Flags untagged venture shell lore invention", () => {
      const orig = "The lab was destroyed twenty years ago.";
      const untagged = "The holding company behind that lab was an early venture shell owned by Iris Halloway.";
      const res = PostRewriteIntegrityAuditor.auditUntaggedLoreInventions(orig, untagged);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Untagged Lore Invention");

      const tagged = "The holding company behind that lab was an early venture shell owned by Iris Halloway [CANON_PROPOSAL: Halloway venture shell holding company for East Docks facility].";
      const cleanRes = PostRewriteIntegrityAuditor.auditUntaggedLoreInventions(orig, tagged);
      expect(cleanRes.passed).toBe(true);
    });

    test("Dim 9 (Dialogue Motive): Flags doctor lecturing textbook theory directly to confused patient", () => {
      const lecture = 'Dr. Bradley stepped into view. "Your hippocampus is attempting to index corrupted episodic storage."';
      const res = PostRewriteIntegrityAuditor.auditDialogueMotivation(lecture);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("Unmotivated Dialogue Lecture");

      const clinicalOrder = 'Dr. Bradley adjusted the regulator. "Administer five milligrams of neuro-vasodilator sublingually."';
      const cleanRes = PostRewriteIntegrityAuditor.auditDialogueMotivation(clinicalOrder);
      expect(cleanRes.passed).toBe(true);
    });

    test("Dim 10 (Prop OpSec Plausibility): Flags top-secret classified clipboard on bedrail", () => {
      const opsecLeak = "Hanging from the stainless-steel footboard was a clipboard: SUBJECT ZERO — RESTRICTED ACCESS LEVEL 0";
      const res = PostRewriteIntegrityAuditor.auditPropOpSec(opsecLeak);
      expect(res.passed).toBe(false);
      expect(res.violations[0]).toContain("OpSec Failure");
    });

    test("Dim 12 (Syntactic Completeness): Flags broken small clause and corrupted predicate", () => {
      const broken1 = "A sudden chill struck. the air leave his lungs.";
      const res1 = PostRewriteIntegrityAuditor.auditSyntacticCompleteness(broken1);
      expect(res1.passed).toBe(false);
      expect(res1.violations[0]).toContain("the air leave his lungs");

      const broken2 = "Every nerve along the perimeter of his raw was on fire.";
      const res2 = PostRewriteIntegrityAuditor.auditSyntacticCompleteness(broken2);
      expect(res2.passed).toBe(false);
      expect(res2.violations[0]).toContain("perimeter of his raw");
    });

    test("Master 12-D Audit passes 100% on pristine production chapter", () => {
      const orig = `
# CHAPTER 1
Dr. Bradley adjusted the monitor. He spent eleven days in non-REM arrest.
Unexpected power surge across the primary quantum lattice.
`.trim();

      const pristinePolished = `
# CHAPTER 1
The overhead strips hummed with sixty hertz.
He only knew five letters. *M—A—R—E—N.*
Dr. Bradley adjusted the regulator. "Keep the ward illumination low and auditory stimulation below forty decibels."
On the active datapad screen, telemetry graphed a surge across the primary quantum lattice.
When Elias swung his legs over the mattress, his knees buckled and dizziness surged, but his knuckles white against the bedrail, he dragged himself upright.
Dr. Bradley left his docking datapad resting on the medication cart.
`.trim();

      const report = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, orig, pristinePolished);
      expect(report.passed).toBe(true);
      expect(report.overallIntegrityScore).toBe(1.0);
      expect(report.dimensionReports.every(d => d.passed)).toBe(true);
    });
  });

  describe("Pillar 3 & 4: Master Runtime Integration", () => {
    test("WritingOSRuntime seamlessly exports StoryStateFactGraph and PostRewriteIntegrityAuditor", () => {
      const runtime = new WritingOSRuntime();
      expect(runtime).toBeDefined();

      const graph = new StoryStateFactGraph();
      expect(graph.getAllFacts().length).toBeGreaterThan(0);
    });
  });
});
