/**
 * Writing OS Core — Document State & Concurrency Manager (P7)
 * Handles cross-document state fact propagation and enforces Optimistic Concurrency Control (OCC)
 * to prevent silent overwriting during concurrent revisions.
 */

import { UniversalStateGraph } from './state-model';

export interface ManagedDocument {
  documentId: string;
  title: string;
  currentVersionId: number;
  content: string;
  lastCommittedAt: number;
}

export interface ConcurrencyCommitResult {
  success: boolean;
  status: 'COMMITTED_SUCCESSFULLY' | 'CONCURRENCY_CONFLICT_DETECTED';
  committedVersionId?: number;
  explanation: string;
}

export class DocumentStateManager {
  private documents: Map<string, ManagedDocument> = new Map();
  private stateGraph: UniversalStateGraph;

  constructor(stateGraph: UniversalStateGraph) {
    this.stateGraph = stateGraph;
  }

  public registerDocument(doc: { documentId: string; title: string; content: string }): ManagedDocument {
    const managed: ManagedDocument = {
      ...doc,
      currentVersionId: 1,
      lastCommittedAt: Date.now(),
    };
    this.documents.set(doc.documentId, managed);
    return managed;
  }

  public getDocumentSnapshot(documentId: string): ManagedDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Commits a revised document using Optimistic Concurrency Control (OCC).
   * Rejects commit if baseVersionId does not match currentVersionId.
   */
  public commitRevision(params: {
    documentId: string;
    baseVersionId: number;
    updatedContent: string;
  }): ConcurrencyCommitResult {
    const doc = this.documents.get(params.documentId);
    if (!doc) {
      return {
        success: false,
        status: 'CONCURRENCY_CONFLICT_DETECTED',
        explanation: `Document "${params.documentId}" not found in DocumentStateManager.`,
      };
    }

    // Check version collision
    if (doc.currentVersionId !== params.baseVersionId) {
      return {
        success: false,
        status: 'CONCURRENCY_CONFLICT_DETECTED',
        explanation: `Concurrent Revision Conflict: Attempted commit on stale snapshot (base: v${params.baseVersionId}, current: v${doc.currentVersionId}). Overwrite prevented.`,
      };
    }

    // Increment version and commit
    doc.currentVersionId += 1;
    doc.content = params.updatedContent;
    doc.lastCommittedAt = Date.now();

    return {
      success: true,
      status: 'COMMITTED_SUCCESSFULLY',
      committedVersionId: doc.currentVersionId,
      explanation: `Revision committed successfully at version v${doc.currentVersionId}.`,
    };
  }

  /**
   * Cross-Document Fact Propagation with State Authority Guard.
   * Only facts with authority >= USER_ASSERTED are allowed to propagate to target documents.
   */
  public propagateFact(params: {
    sourceDocId: string;
    targetDocId: string;
    entityId: string;
    property: string;
    value: unknown;
    authority: 'CANON' | 'SOURCE_VERIFIED' | 'USER_ASSERTED' | 'LLM_PROPOSED';
  }): { allowed: boolean; reason: string } {
    if (params.authority === 'LLM_PROPOSED') {
      return {
        allowed: false,
        reason: 'Unverified LLM_PROPOSED claim rejected from cross-document canon propagation.',
      };
    }

    this.stateGraph.setProperty(params.entityId, params.property, params.value, params.authority, [{
      sourceId: params.sourceDocId,
      authority: params.authority,
      timestamp: Date.now(),
    }]);

    return {
      allowed: true,
      reason: `Fact "${params.entityId}.${params.property}" propagated from "${params.sourceDocId}" to "${params.targetDocId}" under ${params.authority} authority.`,
    };
  }
}
