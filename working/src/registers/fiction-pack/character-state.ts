/**
 * Fiction Pack — Character State & Somatic Ledger
 * Tracks psychic perspective, attention horizons, physical trauma costs, and psychological continuity.
 */

import { BaseEntity, UniversalStateGraph } from '../../core/state-model';

export interface CharacterSomaticState {
  characterId: string;
  fatigueLevel: number; // 0.0 to 10.0
  traumaBurnout: number; // 0.0 to 10.0
  knownSecrets: Set<string>;
  activeSensoryFocus: string;
}

export class CharacterStateLedger {
  public static registerCharacter(
    stateGraph: UniversalStateGraph,
    character: {
      id: string;
      name: string;
      initialTrauma?: number;
      knownSecrets?: string[];
      unknowns?: string[];
    }
  ): BaseEntity {
    const entity = stateGraph.registerEntity({
      id: character.id,
      entityType: 'CHARACTER',
      displayName: character.name,
      properties: {
        traumaLevel: character.initialTrauma ?? 0,
        knownSecrets: character.knownSecrets || [],
      },
    });

    if (character.unknowns) {
      for (const unk of character.unknowns) {
        stateGraph.addUnknown(`${character.id}.${unk}`);
      }
    }

    return entity;
  }

  public static auditSomaticFriction(text: string, stateGraph: UniversalStateGraph, characterId: string): { passed: boolean; violation?: string } {
    const entity = stateGraph.getEntity(characterId);
    if (!entity) return { passed: true };

    const trauma = (entity.properties.get('traumaLevel')?.value as number) || 0;
    if (trauma >= 7.0) {
      if (/\b(?:sprinted effortlessly|ran with easy agility|felt completely fresh|bolted without pain)\b/i.test(text)) {
        return {
          passed: false,
          violation: `Somatic Friction Violation: Character "${characterId}" has trauma level ${trauma}, but text depicts effortless sprinting without somatic cost.`,
        };
      }
    }

    return { passed: true };
  }
}
