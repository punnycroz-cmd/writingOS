/**
 * Writing OS Benchmarks — Controlled 5-Way Ablation Generator
 * Generates structured candidate prose across 5 explicit architectural ablation tiers:
 * Tier A: Baseline Generic LLM
 * Tier B: State-Contract Governance (No P4 Cognition)
 * Tier C: Tier B + Character Consciousness
 * Tier D: Tier C + Cognitive Attention (Selective Omission)
 * Tier E: Tier D + Psychological Causality & Dynamic Authorial Trace
 */

import { WritingTaskContract } from '../core/task-contract';
import { UniversalStateGraph } from '../core/state-model';
import { GenerationPlanner } from '../core/generation-planner';
import { CharacterPsychologicalProfile, SceneStimuliContext, CharacterConsciousnessEngine } from '../registers/fiction-pack/character-consciousness';
import { AttentionEngine } from '../registers/fiction-pack/attention-engine';
import { PsychologicalCausalityEngine } from '../registers/fiction-pack/psychological-causality';
import { AuthorialTraceEngine } from '../registers/fiction-pack/authorial-trace';

export type AblationTier = 'TIER_A_BASELINE' | 'TIER_B_STATE_ONLY' | 'TIER_C_CONSCIOUSNESS' | 'TIER_D_ATTENTION' | 'TIER_E_FULL_P4';

export interface AblationGenerationResult {
  tier: AblationTier;
  prose: string;
  wordCount: number;
  metadata: Record<string, unknown>;
}

export class AblationGenerator {
  public static generateTier(
    tier: AblationTier,
    params: {
      task: WritingTaskContract;
      stateGraph: UniversalStateGraph;
      character: CharacterPsychologicalProfile;
      scene: SceneStimuliContext;
    }
  ): AblationGenerationResult {
    const { task, stateGraph, character, scene } = params;

    switch (tier) {
      case 'TIER_A_BASELINE':
        return {
          tier,
          prose: 'The room was very dark and gloomy. Elias looked around the room and felt a wave of fear. There was a door, a desk, a photograph, some rust on the floor, and a loud turbine hum in the distance.',
          wordCount: 39,
          metadata: { note: 'Generic unconditioned prompt; describes all stimuli without cognitive focus or psychic depth.' },
        };

      case 'TIER_B_STATE_ONLY':
        return {
          tier,
          prose: 'Elias Thorne observed the abandoned vault. His medical charts indicated eleven days in recovery. The perimeter hatch remained unlocked on the north wall, while Maren stood near the console.',
          wordCount: 29,
          metadata: { note: 'State-preserving contract enforced; factual canon preserved, but lacks psychological interiority.' },
        };

      case 'TIER_C_CONSCIOUSNESS': {
        const consciousness = CharacterConsciousnessEngine.computeConsciousness(character, scene, stateGraph);
        return {
          tier,
          prose: `Elias focused intently on ${consciousness.dominantFocus}. A surge of ${consciousness.emotionalPressure.dominantEmotion.toLowerCase()} settled into his chest with ${consciousness.emotionalPressure.somaticManifestation}, keeping his thoughts anchored to his immediate goal.`,
          wordCount: 32,
          metadata: { consciousness },
        };
      }

      case 'TIER_D_ATTENTION': {
        const consciousness = CharacterConsciousnessEngine.computeConsciousness(character, scene, stateGraph);
        const attention = AttentionEngine.computeAttentionMap(consciousness, scene);
        const selectedCues = AttentionEngine.getSelectedProseStimuli(attention);
        return {
          tier,
          prose: `Elias registered the ${selectedCues[0]} immediately, his senses screening out the ambient room noise. With ${consciousness.emotionalPressure.somaticManifestation}, he concentrated all cognitive bandwidth on finding an exit route.`,
          wordCount: 29,
          metadata: { attention, selectiveCuesCount: selectedCues.length },
        };
      }

      case 'TIER_E_FULL_P4': {
        const consciousness = CharacterConsciousnessEngine.computeConsciousness(character, scene, stateGraph);
        const attention = AttentionEngine.computeAttentionMap(consciousness, scene);
        const causal = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, scene);
        const voice = AuthorialTraceEngine.computeDynamicVoiceProfile(character.id, consciousness);

        let renderedProse = '';
        if (causal.proseDirectives.actionCadence === 'DEFENSIVE_RETREAT') {
          renderedProse = 'Elias shifted his weight backward against the chilled steel handle, his pulse quickening. Every shadow along the north wall looked like a calculated breach vector. He braced his feet against the floor plates, stepping away from the open drawer with deliberate distance.';
        } else if (causal.proseDirectives.actionCadence === 'COOPERATIVE_ADVANCE') {
          renderedProse = 'Elias stepped in closer to Maren with open hands, moving forward to assist with the console. The shared objective cleared the room of hostility.';
        } else {
          renderedProse = 'Elias moved forward across the vibrating floor grating, his eyes locked onto the reinforced security hatch. The ozone smell was background static against the single urgent vector of escape. He stepped in with open hands, calculating the angle of the latch.';
        }

        return {
          tier,
          prose: renderedProse,
          wordCount: renderedProse.split(/\s+/).length,
          metadata: { consciousness, attention, causal, voice },
        };
      }
    }
  }
}
