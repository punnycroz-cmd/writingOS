// POST /api/rewrite
// Validate → if rejected, generate repair → revalidate independently.
//
// Body: { text, originalText, stateContext?, inventionPolicy?, register? }
// Response: { decision, finalText, originalValidation, repair, revalidation }

import { NextRequest, NextResponse } from 'next/server';
import { runDeterministicTriage } from '@/engine/deterministic/index';
import { revalidate } from '@/engine/semantic/repair';
import { llmConfigured } from '@/engine/llm';
import type { DocumentState, InventionPolicy } from '@/engine/semantic/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMPTY_STATE: DocumentState = {
  character: { identity: '', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [] },
  informationOwnership: { entries: [] },
  canon: { facts: [] },
  deferredChecks: [],
  sceneId: 'api', revisionId: 0,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidate = body.text;
    const original = body.originalText ?? body.text;
    if (!candidate || typeof candidate !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const state: DocumentState = {
      ...EMPTY_STATE,
      ...(body.stateContext || {}),
      character: { ...EMPTY_STATE.character, ...(body.stateContext?.character || {}) },
      informationOwnership: body.stateContext?.informationOwnership || { entries: [] },
      canon: body.stateContext?.canon || { facts: [] },
    };
    const policy = (body.inventionPolicy || 'LICENSED_FICTION') as InventionPolicy;

    const triage = runDeterministicTriage({
      originalText: original, candidateText: candidate, state, policy,
    });

    const result = await revalidate({
      candidateText: candidate,
      originalText: original,
      documentState: state,
      inventionPolicy: policy,
      triageResult: triage,
      handoffPayload: triage.handoffPayload,
    });

    return NextResponse.json({
      decision: result.originalValidation.decision,
      finalText: result.finalText,
      repairAttempted: result.repairAttempted,
      repairAccepted: result.repairAccepted,
      validation: result.originalValidation,
      repair: result.repairResult,
      revalidation: result.revalidationResult,
      triage,
      llmConfigured: llmConfigured(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
