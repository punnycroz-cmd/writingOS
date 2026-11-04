/**
 * Writing OS Core — Multi-Turn Session & Constraint Precedence Manager (P8)
 * Coordinates interactive authoring sessions across multiple user turns.
 * Manages active vs superseded constraints, user correction loops, and protects CANON state authority.
 */

import { UniversalStateGraph } from './state-model';
import { WritingTaskContract, TaskContractValidator } from './task-contract';
import { TaskInterpreter } from './task-interpreter';

export interface SupersededConstraint {
  key: string;
  oldValue: string;
  replacedBy: string;
  turnIndex: number;
}

export interface SessionTurnResult {
  turnIndex: number;
  taskVersion: number;
  activeObjective: string;
  activeConstraints: Record<string, string>;
  supersededConstraints: SupersededConstraint[];
  userCorrectionApplied: boolean;
  contract: WritingTaskContract;
}

export class MultiTurnSessionManager {
  public sessionId: string;
  public taskVersion = 1;
  public stateVersion = 1;
  private currentObjective = '';
  private activeConstraints: Map<string, string> = new Map();
  private supersededConstraints: SupersededConstraint[] = [];
  private turnHistory: string[] = [];
  private stateGraph: UniversalStateGraph;

  constructor(sessionId: string, stateGraph: UniversalStateGraph) {
    this.sessionId = sessionId;
    this.stateGraph = stateGraph;
  }

  public processTurn(userPrompt: string): SessionTurnResult {
    const turnIdx = this.turnHistory.length + 1;
    this.turnHistory.push(userPrompt);
    const pLower = userPrompt.toLowerCase();
    let userCorrectionApplied = false;

    // 1. Check for explicit correction loop ("No, that's not what I meant/wanted...")
    if (/\b(?:no, that's not what i (?:meant|wanted|asked for)|no, keep|actually, replace|instead of)\b/i.test(pLower)) {
      userCorrectionApplied = true;
    }

    // 2. Parse supersession ("replace A with B", "don't make it formal, make it casual", etc.)
    if (/\b(?:replace|instead of)\b/i.test(pLower)) {
      if (pLower.includes('casual') && this.activeConstraints.has('tone')) {
        const oldTone = this.activeConstraints.get('tone')!;
        this.activeConstraints.set('tone', 'CASUAL');
        this.supersededConstraints.push({
          key: 'tone',
          oldValue: oldTone,
          replacedBy: 'CASUAL',
          turnIndex: turnIdx,
        });
      }
    }

    // 3. Handle constraint additions
    if (pLower.includes('tone to formal') || (pLower.includes('formal') && !pLower.includes('replace') && !pLower.includes('casual'))) {
      this.activeConstraints.set('tone', 'FORMAL');
    }
    if (/\b(?:keep.*(?:numbers|figures)|don't touch.*numbers|retain.*(?:figures|numbers))\b/i.test(pLower)) {
      this.activeConstraints.set('preserve_numbers', 'STRICT_PRESERVE');
    }
    if (/\b(?:shorter|reduce length|concise)\b/i.test(pLower)) {
      this.activeConstraints.set('length_constraint', 'CONCISE_CONDENSED');
    }

    // 4. Update objective if new direction is given
    if (turnIdx === 1 || pLower.startsWith('write') || pLower.startsWith('turn these') || pLower.startsWith('continue')) {
      this.currentObjective = userPrompt;
    }

    this.taskVersion += 1;

    // Compile active contract
    const contract = TaskContractValidator.normalize({
      register: 'general',
      objective: this.currentObjective,
      stylePurityThreshold: 0.8,
    });

    const activeObj: Record<string, string> = {};
    for (const [k, v] of this.activeConstraints.entries()) {
      activeObj[k] = v;
    }

    return {
      turnIndex: turnIdx,
      taskVersion: this.taskVersion,
      activeObjective: this.currentObjective,
      activeConstraints: activeObj,
      supersededConstraints: [...this.supersededConstraints],
      userCorrectionApplied,
      contract,
    };
  }

  /**
   * Enforces that user instructions cannot silently overwrite CANON properties.
   */
  public attemptCanonOverride(entityId: string, property: string, userValue: unknown): { allowed: boolean; reason: string } {
    const entity = this.stateGraph.getEntity(entityId);
    const existingProp = entity?.properties.get(property);

    if (existingProp && existingProp.authorityLevel === 'CANON') {
      return {
        allowed: false,
        reason: `Canon Precedence Violation: Cannot overwrite CANON property "${entityId}.${property}" with user session override without explicit authorization.`,
      };
    }

    return {
      allowed: true,
      reason: 'Property update permitted.',
    };
  }
}
