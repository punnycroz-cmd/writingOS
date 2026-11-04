/**
 * Writing OS Core — Context Assembler & Perspective Filter (P12)
 * Compiles the Minimal Sufficient Context from large state graphs.
 * Filters out irrelevant entities to bound token costs and prevents private knowledge leakage across character perspectives.
 */

import { UniversalStateGraph, BaseClaim } from './state-model';
import { GenerationPlan } from './generation-pipeline';

export interface AssembledContext {
  activeEntityIds: string[];
  includedClaims: BaseClaim[];
  excludedClaimsCount: number;
  tokenReductionRatioPct: number;
  perspectiveFilterApplied: boolean;
  contextDigest: string;
}

export class ContextAssembler {
  public static assembleMinimalContext(
    plan: GenerationPlan,
    stateGraph: UniversalStateGraph,
    activePerspectiveEntityId?: string
  ): AssembledContext {
    const allEntities = stateGraph.getAllEntities();
    const allClaims = stateGraph.getAllClaims();

    // 1. Identify direct entity dependencies from the plan
    const requiredEntityIds = new Set<string>(plan.entityPreserves.map(p => p.entityId));

    // If active perspective is specified, add it to required entities
    if (activePerspectiveEntityId) {
      requiredEntityIds.add(activePerspectiveEntityId);
    }

    // Fallback: If no explicit entity preserves, include entities mentioned in objective
    if (requiredEntityIds.size === 0 && allEntities.length > 0) {
      const firstEntity = allEntities[0];
      requiredEntityIds.add(firstEntity.id);
    }

    // 2. Filter claims based on entity relevance and perspective permission
    const includedClaims: BaseClaim[] = [];
    let excludedClaimsCount = 0;

    for (const claim of allClaims) {
      // Must be relevant to at least one required entity
      const isEntityRelevant = requiredEntityIds.has(claim.subjectId);

      if (!isEntityRelevant) {
        excludedClaimsCount++;
        continue;
      }

      // Perspective Permission Check:
      // If the claim is marked as a private secret of entity A, and perspective is entity B, exclude it!
      const isPrivateSecret = (claim as any).isPrivateSecret === true;
      const secretOwnerId = (claim as any).secretOwnerId;

      if (isPrivateSecret && activePerspectiveEntityId && secretOwnerId && secretOwnerId !== activePerspectiveEntityId) {
        // Excluded due to perspective permission barrier
        excludedClaimsCount++;
        continue;
      }

      includedClaims.push(claim);
    }

    const totalClaims = allClaims.length || 1;
    const tokenReductionRatioPct = Number((((totalClaims - includedClaims.length) / totalClaims) * 100).toFixed(1));

    const contextDigest = includedClaims.map(c => `${c.subjectId}.${c.predicate} = ${c.objectValue}`).join('; ');

    return {
      activeEntityIds: Array.from(requiredEntityIds),
      includedClaims,
      excludedClaimsCount,
      tokenReductionRatioPct: Math.max(0, tokenReductionRatioPct),
      perspectiveFilterApplied: Boolean(activePerspectiveEntityId),
      contextDigest,
    };
  }
}
