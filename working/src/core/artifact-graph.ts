/**
 * Writing OS Core — Writing Artifact Graph Engine (P8.1)
 * Manages the lifecycle and state machine of all authoring artifacts:
 * States: STALE | INVALID | SUPERSEDED | REJECTED | ABANDONED | COMMITTED | PENDING_VALIDATION
 */

export type ArtifactLifecycleStatus = 
  | 'PENDING_VALIDATION'
  | 'STALE'
  | 'INVALID'
  | 'SUPERSEDED'
  | 'REJECTED'
  | 'ABANDONED'
  | 'COMMITTED';

export type ArtifactType = 'TASK' | 'STATE' | 'PLAN' | 'CANDIDATE' | 'REPAIR' | 'VALIDATION';

export interface ArtifactGraphNode {
  artifactId: string;
  artifactType: ArtifactType;
  version: number;
  status: ArtifactLifecycleStatus;
  dependencies: Array<{ artifactId: string; version: number }>;
  payload: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export class WritingArtifactGraph {
  private nodes: Map<string, ArtifactGraphNode> = new Map();

  public registerArtifact(node: Omit<ArtifactGraphNode, 'createdAt' | 'updatedAt'>): ArtifactGraphNode {
    const fullNode: ArtifactGraphNode = {
      ...node,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.nodes.set(node.artifactId, fullNode);
    return fullNode;
  }

  public updateStatus(artifactId: string, newStatus: ArtifactLifecycleStatus, reason?: string): boolean {
    const node = this.nodes.get(artifactId);
    if (!node) return false;

    node.status = newStatus;
    node.updatedAt = Date.now();
    if (reason) {
      node.payload['statusTransitionReason'] = reason;
    }
    return true;
  }

  public getArtifact(artifactId: string): ArtifactGraphNode | undefined {
    return this.nodes.get(artifactId);
  }

  /**
   * Cascades invalidation: if parent artifact becomes STALE, downstream dependent artifacts become STALE.
   */
  public cascadeStaleStatus(parentArtifactId: string): string[] {
    const parentNode = this.nodes.get(parentArtifactId);
    if (!parentNode) return [];

    parentNode.status = 'STALE';
    const invalidatedIds: string[] = [parentArtifactId];

    for (const [id, node] of this.nodes.entries()) {
      const dependsOnParent = node.dependencies.some(d => d.artifactId === parentArtifactId);
      if (dependsOnParent && node.status !== 'COMMITTED') {
        node.status = 'STALE';
        node.updatedAt = Date.now();
        invalidatedIds.push(id);
      }
    }

    return invalidatedIds;
  }
}
