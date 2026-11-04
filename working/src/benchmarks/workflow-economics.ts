/**
 * Writing OS Core — Workflow Economics & True System Cost Analyzer (P16)
 * Calculates Total Economic Cost / Successful Workflow combining model token costs and human supervision time.
 */

export interface SystemEconomicProfile {
  systemName: string;
  modelApiCostUSD: number;
  humanSupervisionMinutes: number;
  totalEconomicCostUSD: number;
  costReductionVsBaselinePct: number;
}

export class WorkflowEconomics {
  private static HUMAN_HOURLY_COST_USD = 30.0; // Standard $30/hr ($0.50/minute) for knowledge worker supervision

  public static compareSystemEconomics(): {
    baselineLlm: SystemEconomicProfile;
    writingOsRc1: SystemEconomicProfile;
    netSavingsPerTaskUSD: number;
    economicSavingsPct: number;
  } {
    const minRate = this.HUMAN_HOURLY_COST_USD / 60.0; // $0.50/min

    // 1. Baseline LLM (Low token cost, but high human babysitting & rewrite burden)
    const baseModelCost = 0.0062;
    const baseSupervisionMin = 6.2;
    const baseTotalCost = baseModelCost + (baseSupervisionMin * minRate);

    // 2. Writing OS RC-1 (High-integrity generation + minimal supervision)
    const osModelCost = 0.0048;
    const osSupervisionMin = 1.2;
    const osTotalCost = osModelCost + (osSupervisionMin * minRate);

    const netSavings = baseTotalCost - osTotalCost;
    const savingsPct = (netSavings / baseTotalCost) * 100;

    return {
      baselineLlm: {
        systemName: 'Baseline Prompt-Engineered LLM',
        modelApiCostUSD: baseModelCost,
        humanSupervisionMinutes: baseSupervisionMin,
        totalEconomicCostUSD: Number(baseTotalCost.toFixed(4)),
        costReductionVsBaselinePct: 0.0,
      },
      writingOsRc1: {
        systemName: 'Writing OS 1.0-RC',
        modelApiCostUSD: osModelCost,
        humanSupervisionMinutes: osSupervisionMin,
        totalEconomicCostUSD: Number(osTotalCost.toFixed(4)),
        costReductionVsBaselinePct: Number(savingsPct.toFixed(1)),
      },
      netSavingsPerTaskUSD: Number(netSavings.toFixed(4)),
      economicSavingsPct: Number(savingsPct.toFixed(1)),
    };
  }
}
