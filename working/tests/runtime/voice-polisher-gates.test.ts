import { describe, test, expect } from "bun:test";
import { VoicePolisher } from "../../src/runtime/voice-polisher";
import { FictionQualityEvaluator } from "../../src/runtime/fiction-evaluator";

describe("VoicePolisher 4-Gate Architecture & Spec-Clutter Prevention", () => {
  describe("Gate 1: POV Distinct Voice Filter", () => {
    test("ELIAS POV accepts neuro-cognitive perceptual terms", () => {
      const input = "Elias felt the synaptic latency spike as the neural interface overloaded.";
      const report = VoicePolisher.polish(input, { pov: "ELIAS" });
      
      const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
      expect(povGate).toBeDefined();
      expect(povGate?.passed).toBe(true);
      expect(report.voiceIntegrityScore).toBeGreaterThanOrEqual(0.75);
    });

    test("ELIAS POV flags clashing military ballistic jargon", () => {
      const input = "Elias braced his rail-carbine against the sandbag parapet.";
      const report = VoicePolisher.polish(input, { pov: "ELIAS" });
      
      const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
      expect(povGate?.passed).toBe(false);
      expect(povGate?.notes.some(n => n.includes("rail-carbine") || n.includes("sandbag"))).toBe(true);
    });

    test("MAREN POV accepts clipped survivalist perception", () => {
      const input = "Maren ducked into the vent conduit, her grip tight on the sidearm.";
      const report = VoicePolisher.polish(input, { pov: "MAREN" });
      
      const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
      expect(povGate?.passed).toBe(true);
    });

    test("CORWIN POV accepts tactical procedural terrain and flags romantic abstractions", () => {
      const input = "Corwin stared at the singing constellations like a lullaby.";
      const report = VoicePolisher.polish(input, { pov: "CORWIN" });
      
      const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
      expect(povGate?.passed).toBe(false);
      expect(povGate?.notes.some(n => n.includes("constellations") || n.includes("lullaby"))).toBe(true);
    });
  });

  describe("Gate 2: Scene Tempo, Register & Rhythm Waveform", () => {
    test("ACTION_SPRINT strictly prohibits technical spec clutter", () => {
      const input = "Corwin sprinted across the roof while the turbine spun at 14,000 RPM at 200 PSI.";
      const report = VoicePolisher.polish(input, { tempo: "ACTION_SPRINT" });
      
      const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
      expect(tempoGate?.passed).toBe(false);
      expect(tempoGate?.notes.some(n => n.includes("prohibits technical spec measurements"))).toBe(true);
    });

    test("INTIMATE_QUIET suppresses hardware spec dumps", () => {
      const input = "She looked at the old photo while the generator pulsed at 40 Hz.";
      const report = VoicePolisher.polish(input, { tempo: "INTIMATE_QUIET" });
      
      const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
      expect(tempoGate?.passed).toBe(false);
    });

    test("TACTICAL_PROCEDURAL allows measured, non-cluttered details", () => {
      const input = "Corwin checked the capacitor charge before advancing down the corridor.";
      const report = VoicePolisher.polish(input, { tempo: "TACTICAL_PROCEDURAL" });
      
      const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
      expect(tempoGate?.passed).toBe(true);
    });
  });

  describe("Gate 3: Stakes & Emotional Access Preservation", () => {
    test("Flags when emotional stakes are traded solely for mechanical inventory", () => {
      const original = "Elias clenched his fists as the weight of the prophecy pressed on his shoulders.";
      const report = VoicePolisher.polish(original);
      const stakesGate = report.gateResults.find(g => g.gate === "GATE_3_STAKES_PRESERVATION");
      expect(stakesGate).toBeDefined();
    });

    test("Passes when stakes are preserved through concrete human consequence", () => {
      const goodPolish = "Elias stared at the terminal; the colony's survival depended on his next keystroke.";
      const report = VoicePolisher.polish(goodPolish);
      const stakesGate = report.gateResults.find(g => g.gate === "GATE_3_STAKES_PRESERVATION");
      expect(stakesGate?.passed).toBe(true);
    });
  });

  describe("Spec-Clutter Guard & Fiction Evaluator Integration", () => {
    test("Spec-clutter guard detects excessive measurement clustering", () => {
      const input = "The core ran at 40 Hz and 14,000 RPM, discharging 300 joules and 120 millivolts under 200 PSI.";
      const report = VoicePolisher.polish(input);
      
      const clutterGuard = report.gateResults.find(g => g.gate === "SPEC_CLUTTER_GUARD");
      expect(clutterGuard?.passed).toBe(false);
      expect(report.specClutterCount).toBeGreaterThanOrEqual(4);
    });

    test("FictionQualityEvaluator flags FICTION_RULE_06_SPEC_CLUTTER_HOMOGENIZATION on spec-heavy manuscripts", () => {
      const specHeavyDraft = `
        The reactor thrummed at 40 Hz as the intake turbine accelerated to 14,000 RPM.
        Elias calibrated the magnetic coil to 300 joules while monitoring the 120 millivolts feedback loop.
        Pressure inside the manifold reached 200 PSI at minus 4 degrees C.
        Corwin checked the 142.8 MHz radio signal while the sub-station pulled 40 megawatts.
        The emergency relay tripped at 60 Hz, venting liquid nitrogen at 150 PSI.
        Every terminal displayed identical diagnostics across the three sectors of the facility.
        The secondary battery dropped to 24 volts before the primary capacitor engaged.
        They watched the telemetry update every 50 milliseconds across the central console grid.
        He adjusted the frequency by 10 kHz to bypass the local surveillance array.
        The system temperature stabilized at 18 degrees C after the cooling cycle completed.
      `;
      
      const evalReport = FictionQualityEvaluator.evaluate(specHeavyDraft);
      expect(evalReport.metrics.specClutterDensity).toBeGreaterThan(6.0);
      expect(evalReport.violations.some(v => v.code === "FICTION_RULE_06_SPEC_CLUTTER_HOMOGENIZATION")).toBe(true);
    });
  });

  describe("Gate 4: Canon Anti-Drift & Proposal Engine", () => {
    test("POLISH mode flags unverified hallucinated lore without CANON_PROPOSAL tag", () => {
      const original = "Corwin's compass pointed toward the echo of a memory.";
      const unverifiedDrift = "Corwin's tracking beacon locked onto the transponder signal from his brother's vehicle.";
      
      const report = VoicePolisher.polish(unverifiedDrift, { mode: "POLISH", sourceDraft: original });
      const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
      expect(gate4?.passed).toBe(false);
      expect(gate4?.notes.some(n => n.includes("Semantic Drift: Invented unverified relationship 'brother'"))).toBe(true);
    });

    test("Passes when unverified lore is explicitly tagged as CANON_PROPOSAL", () => {
      const original = "Corwin's compass pointed toward the echo of a memory.";
      const taggedProposal = "Corwin's tracking beacon locked onto the transponder signal from his brother's vehicle. [CANON_PROPOSAL: Brother's beacon]";
      
      const report = VoicePolisher.polish(taggedProposal, { mode: "POLISH", sourceDraft: original });
      const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
      expect(gate4?.passed).toBe(true);
    });

    test("CREATIVE_RECONSTRUCTION mode allows generative scene invention", () => {
      const expansion = "Corwin searched the wreckage, finding his brother's dog tag.";
      const report = VoicePolisher.polish(expansion, { mode: "CREATIVE_RECONSTRUCTION" });
      const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
      expect(gate4?.passed).toBe(true);
    });
  });

  describe("Dynamic Situational/Emotional States & Sparse Sentence Protection", () => {
    test("Sparse sentence protection preserves short, unadorned pacing lines without bloat", () => {
      const shortLines = ["Silence.", "He waited.", "Nothing moved.", "She closed her eyes."];
      for (const line of shortLines) {
        const report = VoicePolisher.polish(line);
        expect(report.polishedText).toBe(line);
        expect(report.decision).toBe("KEEP");
        expect(report.specClutterCount).toBe(0);
      }
    });

    test("MAREN in PEACE_REFLECTIVE state allows softer memory and relaxed cadence", () => {
      const peacefulReflection = "Maren leaned against the wooden railing, listening to the rain fall across the garden.";
      const report = VoicePolisher.polish(peacefulReflection, {
        pov: "MAREN",
        threatLevel: "PEACE_REFLECTIVE",
        emotionalState: "GRIEVING_NUMB",
      });
      const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
      expect(povGate?.passed).toBe(true);
    });

    test("LETHAL_COMBAT penalizes overly long meandering sentences", () => {
      const ramblingCombat = "Corwin slowly thought about his past life while wandering around the open courtyard as heavy machine gun fire continued to erupt all around him without pause.";
      const report = VoicePolisher.polish(ramblingCombat, {
        pov: "CORWIN",
        threatLevel: "LETHAL_COMBAT",
        emotionalState: "PANIC_OVERLOAD",
      });
      const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
      expect(tempoGate?.passed).toBe(false);
      expect(tempoGate?.notes[0]).toContain("too long for ACTION_SPRINT");
    });
  });
});


