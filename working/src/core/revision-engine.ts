/**
 * Writing OS Core — Generic Revision Architecture
 * Modular pipeline decomposing revisions into Structural, Semantic, Register, Voice, and Craft layers.
 */

import { WritingTaskContract } from './task-contract';
import { UniversalStateGraph } from './state-model';

export interface RevisionPassResult {
  passName: 'STRUCTURAL' | 'SEMANTIC' | 'REGISTER' | 'VOICE' | 'CRAFT';
  modifiedText: string;
  appliedChangesCount: number;
  changeLog: string[];
}

export interface FullRevisionReport {
  originalText: string;
  revisedText: string;
  totalChanges: number;
  passes: RevisionPassResult[];
}

export class ModularRevisionEngine {
  public static executeRevisionPipeline(
    inputText: string,
    task: WritingTaskContract,
    stateGraph: UniversalStateGraph,
    registerPass?: (text: string) => { text: string; changes: string[] }
  ): FullRevisionReport {
    let currentText = inputText;
    const passes: RevisionPassResult[] = [];

    // 1. STRUCTURAL PASS: Formatting, spacing, linebreaks, empty clause cleanup
    const structuralChanges: string[] = [];
    let structuralText = currentText.replace(/[ \t]{2,}/g, ' ');
    structuralText = structuralText.replace(/\n{3,}/g, '\n\n');
    if (structuralText !== currentText) {
      structuralChanges.push('Normalized excess whitespace and multiple empty line breaks.');
      currentText = structuralText;
    }
    passes.push({
      passName: 'STRUCTURAL',
      modifiedText: currentText,
      appliedChangesCount: structuralChanges.length,
      changeLog: structuralChanges,
    });

    // 2. SEMANTIC PASS: Verify claims and prune unsupported assertions
    const semanticChanges: string[] = [];
    // If strict non-invention is enabled, flag or clean ungrounded markers
    if (task.inventionPolicy === 'STRICT_NONE') {
      const ungroundedMatches = currentText.match(/\[CANON_PROPOSAL:[^\]]+\]/g);
      if (ungroundedMatches) {
        currentText = currentText.replace(/\[CANON_PROPOSAL:[^\]]+\]/g, '');
        semanticChanges.push(`Stripped ${ungroundedMatches.length} unauthorized invention proposals under STRICT_NONE policy.`);
      }
    }
    passes.push({
      passName: 'SEMANTIC',
      modifiedText: currentText,
      appliedChangesCount: semanticChanges.length,
      changeLog: semanticChanges,
    });

    // 3. REGISTER PASS: Delegate to the attached Register Pack (if provided)
    const regChanges: string[] = [];
    if (registerPass) {
      const regRes = registerPass(currentText);
      currentText = regRes.text;
      regChanges.push(...regRes.changes);
    }
    passes.push({
      passName: 'REGISTER',
      modifiedText: currentText,
      appliedChangesCount: regChanges.length,
      changeLog: regChanges,
    });

    // 4. VOICE PASS: Formality and Filter Word pruning (if required by task)
    const voiceChanges: string[] = [];
    if (!task.voiceRequirements.allowedFilterWords) {
      const filterRegex = /\b(?:he saw that|she noticed that|he realized that|she felt that)\s+/gi;
      const matchCount = (currentText.match(filterRegex) || []).length;
      if (matchCount > 0) {
        currentText = currentText.replace(filterRegex, '');
        voiceChanges.push(`Pruned ${matchCount} filter word constructions to enforce psychic immediacy.`);
      }
    }
    passes.push({
      passName: 'VOICE',
      modifiedText: currentText,
      appliedChangesCount: voiceChanges.length,
      changeLog: voiceChanges,
    });

    // 5. CRAFT PASS: Rhythm, Burstiness, and punctuation pacing
    const craftChanges: string[] = [];
    // Measure sentence variance
    const sentences = currentText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
    const variance = lengths.length > 0 ? lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length : 0;
    const stdDev = Math.sqrt(variance);

    const targetBurstiness = (task.diagnosticMetrics?.minBurstinessStdDev as number) || 0;
    if (targetBurstiness > 0 && stdDev < targetBurstiness) {
      craftChanges.push(`Diagnostic: Sentence length StdDev is ${stdDev.toFixed(2)} (benchmark target >= ${targetBurstiness}).`);
    }

    passes.push({
      passName: 'CRAFT',
      modifiedText: currentText,
      appliedChangesCount: craftChanges.length,
      changeLog: craftChanges,
    });

    const totalChanges = passes.reduce((acc, p) => acc + p.appliedChangesCount, 0);

    return {
      originalText: inputText,
      revisedText: currentText,
      totalChanges,
      passes,
    };
  }
}
