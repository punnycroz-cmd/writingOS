/**
 * Writing OS Core — Multi-User & Multi-Tenant Isolation Manager (P12)
 * Enforces strict memory and state isolation across multiple concurrent users and tenants.
 * Prevents cross-session state leakage even when entity keys and IDs are identical.
 */

import { UniversalStateGraph } from './state-model';
import { MultiTurnSessionManager } from './session-manager';

export interface TenantSessionContext {
  tenantId: string;
  userId: string;
  sessionId: string;
  sessionManager: MultiTurnSessionManager;
  stateGraph: UniversalStateGraph;
  createdAt: number;
}

export class MultiUserIsolationManager {
  private sessions = new Map<string, TenantSessionContext>();

  private formatKey(tenantId: string, userId: string, sessionId: string): string {
    return `${tenantId}:${userId}:${sessionId}`;
  }

  public getOrCreateSession(tenantId: string, userId: string, sessionId: string): TenantSessionContext {
    const key = this.formatKey(tenantId, userId, sessionId);
    let session = this.sessions.get(key);

    if (!session) {
      const stateGraph = new UniversalStateGraph();
      const sessionManager = new MultiTurnSessionManager(sessionId, stateGraph);
      session = {
        tenantId,
        userId,
        sessionId,
        sessionManager,
        stateGraph,
        createdAt: Date.now(),
      };
      this.sessions.set(key, session);
    }

    return session;
  }

  public auditCrossTenantIsolation(
    tenantA: string,
    userA: string,
    sessionA: string,
    tenantB: string,
    userB: string,
    sessionB: string
  ): {
    isIsolated: boolean;
    tenantAEntityCount: number;
    tenantBEntityCount: number;
    crossLeakageDetected: boolean;
  } {
    const ctxA = this.getOrCreateSession(tenantA, userA, sessionA);
    const ctxB = this.getOrCreateSession(tenantB, userB, sessionB);

    // Verify distinct state graph memory references
    const isDistinctGraph = ctxA.stateGraph !== ctxB.stateGraph;

    // Check entity counts
    const countA = ctxA.stateGraph.getAllEntities().length;
    const countB = ctxB.stateGraph.getAllEntities().length;

    // Verify no cross-tenant leakage
    const claimsA = ctxA.stateGraph.getAllClaims();
    const claimsB = ctxB.stateGraph.getAllClaims();

    const setBClaimIds = new Set(claimsB.map(c => c.id));
    const crossLeakageDetected = claimsA.some(cA => setBClaimIds.has(cA.id));

    return {
      isIsolated: isDistinctGraph && !crossLeakageDetected,
      tenantAEntityCount: countA,
      tenantBEntityCount: countB,
      crossLeakageDetected,
    };
  }
}
