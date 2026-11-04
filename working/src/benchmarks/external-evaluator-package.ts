/**
 * Writing OS Benchmarks — Standalone External Evaluator Package (P14)
 * Hermetic standalone benchmarking package enabling independent third-party evaluators
 * to execute evaluations, erase provenance metadata, and reproduce decision traces.
 */

export interface BlindCandidateOutput {
  label: 'OUTPUT_A' | 'OUTPUT_B' | 'OUTPUT_C';
  text: string;
}

export interface BlindEvaluationBundle {
  taskId: string;
  blindCandidates: BlindCandidateOutput[];
  keyMapping: Record<string, string>; // Kept sealed until evaluation is completed
}

export class ExternalEvaluatorPackage {
  public static createBlindEvaluationBundle(
    taskId: string,
    candidates: { sourceModel: string; text: string }[]
  ): BlindEvaluationBundle {
    // Deterministic pseudo-random shuffle to remove position bias
    const labels: ('OUTPUT_A' | 'OUTPUT_B' | 'OUTPUT_C')[] = ['OUTPUT_A', 'OUTPUT_B', 'OUTPUT_C'];
    const keyMapping: Record<string, string> = {};
    const blindCandidates: BlindCandidateOutput[] = [];

    // Shuffle
    const shuffled = [...candidates].reverse();

    shuffled.forEach((c, idx) => {
      const label = labels[idx] || 'OUTPUT_C';
      blindCandidates.push({ label, text: c.text });
      keyMapping[label] = c.sourceModel;
    });

    return {
      taskId,
      blindCandidates,
      keyMapping,
    };
  }

  public static verifyReproducibleDecisionTrace(
    traceA: { decision: string; integrityScore: number; qualityScore: number },
    traceB: { decision: string; integrityScore: number; qualityScore: number }
  ): { isDeterministic: boolean; deltaIntegrity: number; deltaQuality: number } {
    const deltaIntegrity = Math.abs(traceA.integrityScore - traceB.integrityScore);
    const deltaQuality = Math.abs(traceA.qualityScore - traceB.qualityScore);
    const isDeterministic = traceA.decision === traceB.decision && deltaIntegrity === 0 && deltaQuality === 0;

    return {
      isDeterministic,
      deltaIntegrity,
      deltaQuality,
    };
  }
}
