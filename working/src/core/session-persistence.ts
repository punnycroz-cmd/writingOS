/**
 * Writing OS Core — Session Persistence & Recovery Engine (P8.1)
 * Serializes and restores multi-turn authoring sessions across process restarts.
 * Ensures zero state loss, preserves active/superseded constraints, and prevents ghost candidates.
 */

import { UniversalStateGraph } from './state-model';
import { MultiTurnSessionManager, SupersededConstraint } from './session-manager';

export interface SerializedSessionPayload {
  sessionId: string;
  taskVersion: number;
  stateVersion: number;
  currentObjective: string;
  activeConstraints: Record<string, string>;
  supersededConstraints: SupersededConstraint[];
  turnHistory: string[];
  savedAt: number;
}

export class SessionPersistence {
  public static serializeSession(session: MultiTurnSessionManager): string {
    const activeConstraintsObj: Record<string, string> = {};
    const activeMap = (session as any).activeConstraints as Map<string, string> | undefined;
    if (activeMap) {
      for (const [k, v] of activeMap.entries()) {
        activeConstraintsObj[k] = v;
      }
    }

    const payload: SerializedSessionPayload = {
      sessionId: session.sessionId,
      taskVersion: session.taskVersion,
      stateVersion: session.stateVersion,
      currentObjective: (session as any).currentObjective || '',
      activeConstraints: activeConstraintsObj,
      supersededConstraints: (session as any).supersededConstraints || [],
      turnHistory: (session as any).turnHistory || [],
      savedAt: Date.now(),
    };
    return JSON.stringify(payload);
  }

  public static restoreSession(
    serializedJson: string,
    stateGraph: UniversalStateGraph
  ): MultiTurnSessionManager {
    const payload: SerializedSessionPayload = JSON.parse(serializedJson);
    const session = new MultiTurnSessionManager(payload.sessionId, stateGraph);

    session.taskVersion = payload.taskVersion;
    session.stateVersion = payload.stateVersion;
    (session as any).currentObjective = payload.currentObjective;
    (session as any).turnHistory = payload.turnHistory;
    (session as any).supersededConstraints = payload.supersededConstraints;

    const activeMap = new Map<string, string>();
    for (const [k, v] of Object.entries(payload.activeConstraints)) {
      activeMap.set(k, v);
    }
    (session as any).activeConstraints = activeMap;

    return session;
  }
}
