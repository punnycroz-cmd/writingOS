/**
 * Writing OS Core — Dependency Graph & Version Invalidation Engine (P8)
 * Links TaskVersion, StateVersion, GenerationPlanVersion, and CandidateVersion.
 * Automatically detects stale dependencies and blocks outdated candidate commits.
 * 
 * Formal Invariant: STALE_PLAN & STALE_CANDIDATE_PROTECTION
 */

export interface VersionedDependencyNode {
  nodeId: string;
  nodeType: 'TASK' | 'STATE' | 'PLAN' | 'CANDIDATE';
  version: number;
  parentDependencies: Array<{ nodeType: 'TASK' | 'STATE' | 'PLAN'; version: number }>;
  createdAt: number;
}

export interface CandidateFreshnessAudit {
  isFresh: boolean;
  status: 'FRESH_FOR_COMMIT' | 'STALE_CANDIDATE_REJECTED' | 'STALE_PLAN_REJECTED';
  reason: string;
  mismatchedDependencies: string[];
}

export class DependencyGraphManager {
  private nodes: Map<string, VersionedDependencyNode> = new Map();

  public registerNode(node: VersionedDependencyNode): void {
    this.nodes.set(node.nodeId, node);
  }

  public getNode(nodeId: string): VersionedDependencyNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Audits whether a candidate is fresh against the active system versions.
   */
  public auditCandidateFreshness(params: {
    candidateId: string;
    currentTaskVersion: number;
    currentStateVersion: number;
    currentPlanVersion: number;
  }): CandidateFreshnessAudit {
    const candidate = this.nodes.get(params.candidateId);
    if (!candidate || candidate.nodeType !== 'CANDIDATE') {
      return {
        isFresh: false,
        status: 'STALE_CANDIDATE_REJECTED',
        reason: `Candidate "${params.candidateId}" not found in DependencyGraph.`,
        mismatchedDependencies: ['CANDIDATE_NOT_REGISTERED'],
      };
    }

    const mismatched: string[] = [];

    for (const dep of candidate.parentDependencies) {
      if (dep.nodeType === 'TASK' && dep.version !== params.currentTaskVersion) {
        mismatched.push(`TaskVersion mismatch (candidate based on v${dep.version}, current is v${params.currentTaskVersion})`);
      }
      if (dep.nodeType === 'STATE' && dep.version !== params.currentStateVersion) {
        mismatched.push(`StateVersion mismatch (candidate based on v${dep.version}, current is v${params.currentStateVersion})`);
      }
      if (dep.nodeType === 'PLAN' && dep.version !== params.currentPlanVersion) {
        mismatched.push(`PlanVersion mismatch (candidate based on v${dep.version}, current is v${params.currentPlanVersion})`);
      }
    }

    if (mismatched.length > 0) {
      return {
        isFresh: false,
        status: 'STALE_CANDIDATE_REJECTED',
        reason: `Stale Candidate Rejected: Candidate dependencies are outdated. [${mismatched.join('; ')}].`,
        mismatchedDependencies: mismatched,
      };
    }

    return {
      isFresh: true,
      status: 'FRESH_FOR_COMMIT',
      reason: 'Candidate is fully synchronized with active task, state, and plan versions.',
      mismatchedDependencies: [],
    };
  }
}
