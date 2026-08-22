export type HistoricalComparison = 'STABLE_SUCCESS' | 'REGRESSION' | 'IMPROVEMENT' | 'PERSISTENT_DEFECT' | 'KNOWN_DEFECT' | 'CHANGED_UNSCORABLE';
export interface ClassificationInput { expectedFinalDecision: string; historicalObservedDecision: string; historicalCorrect: boolean | undefined; currentFinalDecision: string; currentFinalCorrect: boolean | null; isR6: boolean; isUnresolved: boolean; finalScorable: boolean; }
export function classifyHistoricalComparison(input: ClassificationInput): HistoricalComparison {
  const { historicalCorrect, currentFinalCorrect, isUnresolved, finalScorable } = input;
  if (!finalScorable) return 'CHANGED_UNSCORABLE';
  const h = historicalCorrect === true; const c = currentFinalCorrect === true;
  if (h && c) return 'STABLE_SUCCESS';
  if (h && !c) return 'REGRESSION';
  if (!h && c) return 'IMPROVEMENT';
  if (!h && !c) return isUnresolved ? 'KNOWN_DEFECT' : 'PERSISTENT_DEFECT';
  return 'CHANGED_UNSCORABLE';
}
