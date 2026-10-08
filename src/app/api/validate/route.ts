// POST /api/validate
// Runs the full Writing OS pipeline on a candidate text.
//
// Body: {
//   mode: 'FICTION' | 'NONFICTION'            (required)
//   text: string                            (required — candidate text)
//   originalText?: string                   (source text for rewrite checking)
//   register?: string
//   inventionPolicy?: 'NONE'|'SOURCE_CONSTRAINED'|'LICENSED_FICTION'|'LIMITED_INFERENCE'
//   stateContext?: DocumentState (partial)  (fiction: character/IO/canon state)
//   assertions?: EvaluatedAssertion[]       (nonfiction: skip extraction)
// }
// Response: WritingOSResponse + extraction provenance.

import { NextRequest, NextResponse } from 'next/server';
import { WritingOSRuntime, type WritingOSRequest } from '@/engine/runtime/writing-os-runtime';
import { llmConfigured } from '@/engine/llm';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let _rt: WritingOSRuntime | null = null;
function getRuntime(): WritingOSRuntime {
  if (!_rt) {
    _rt = new WritingOSRuntime(join(process.cwd(), 'nonfiction/ledger/source-fact-ledger.jsonl'));
  }
  return _rt;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (body.mode !== 'FICTION' && body.mode !== 'NONFICTION') {
      return NextResponse.json({ error: "mode must be 'FICTION' or 'NONFICTION'" }, { status: 400 });
    }

    const request: WritingOSRequest = {
      documentId: body.documentId || `doc-${Date.now()}`,
      mode: body.mode,
      register: body.register,
      text: body.text,
      originalText: body.originalText,
      assertions: body.assertions,
      stateContext: body.stateContext,
      inventionPolicy: body.inventionPolicy,
    };

    const response = await getRuntime().processCandidate(request);
    return NextResponse.json({ ...response, llmConfigured: llmConfigured() });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
