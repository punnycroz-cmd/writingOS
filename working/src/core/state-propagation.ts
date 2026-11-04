/**
 * Writing OS Core — Multi-Scene State Freshness & Propagation Ledger
 * Manages narrative state transitions across sequential scenes, updating character psychology
 * and graph properties in real time to prevent stale cognitive conditioning.
 */

import { UniversalStateGraph } from './state-model';
import { CharacterPsychologicalProfile } from '../registers/fiction-pack/character-consciousness';

export interface NarrativeSceneEvent {
  eventId: string;
  sceneIndex: number;
  actorId: string;
  targetId?: string;
  eventType: 'LIFE_SAVED' | 'BETRAYAL_DISCOVERED' | 'TRAUMA_INFLICTED' | 'DISCOVERY_MADE';
  impact: {
    trustDelta?: number; // e.g. +0.8 or -0.8
    traumaDelta?: number; // e.g. +3.0
    newAuthorizedProperties?: Record<string, unknown>;
  };
  eventDescription: string;
  timestamp: number;
}

export class StatePropagationLedger {
  /**
   * Applies narrative event consequences to both the UniversalStateGraph and CharacterPsychologicalProfile.
   */
  public static propagateEvent(
    event: NarrativeSceneEvent,
    stateGraph: UniversalStateGraph,
    characterProfile: CharacterPsychologicalProfile
  ): CharacterPsychologicalProfile {
    const updatedProfile: CharacterPsychologicalProfile = {
      ...characterProfile,
      trustInOthers: { ...characterProfile.trustInOthers },
      coreMemories: [...characterProfile.coreMemories],
    };

    // 1. Apply Trust Delta
    if (event.targetId && event.impact.trustDelta !== undefined) {
      const currentTrust = updatedProfile.trustInOthers[event.targetId] ?? 0.5;
      const newTrust = Math.min(1.0, Math.max(0.0, currentTrust + event.impact.trustDelta));
      updatedProfile.trustInOthers[event.targetId] = Number(newTrust.toFixed(2));
    }

    // 2. Apply Trauma Delta
    if (event.impact.traumaDelta !== undefined) {
      const currentTrauma = updatedProfile.traumaLevel;
      const newTrauma = Math.min(10.0, Math.max(0.0, currentTrauma + event.impact.traumaDelta));
      updatedProfile.traumaLevel = Number(newTrauma.toFixed(1));
    }

    // 3. Register Authorized Properties in State Graph
    if (event.impact.newAuthorizedProperties) {
      for (const [propName, propVal] of Object.entries(event.impact.newAuthorizedProperties)) {
        stateGraph.setProperty(characterProfile.id, propName, propVal, 'OBSERVED', [{
          sourceId: `event_${event.eventId}`,
          authority: 'OBSERVED',
          timestamp: Date.now(),
        }]);
      }
    }

    // 4. Append Event to Core Memories
    updatedProfile.coreMemories.push(event.eventDescription);

    return updatedProfile;
  }
}
