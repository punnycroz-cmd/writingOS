// src/semantic/prompts/invention-policy.ts
// Invention policy descriptions and helpers.

import { INVENTION_POLICY_PROMPTS } from './system.js';
import type { InventionPolicy } from '../types.js';

export { INVENTION_POLICY_PROMPTS };

export function getPolicyDescription(policy: InventionPolicy): string {
  return INVENTION_POLICY_PROMPTS[policy] || 'Unknown policy.';
}

export const ALL_POLICIES: InventionPolicy[] = ['NONE', 'SOURCE_CONSTRAINED', 'LICENSED_FICTION', 'LIMITED_INFERENCE'];
