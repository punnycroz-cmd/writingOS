// working/tests/phase3/phase3e-integration.test.ts
// Phase 3E Master Integration Tests for WritingOSRuntime.

import { describe, it, expect } from 'bun:test';
import { WritingOSRuntime, WritingOSRequest } from '../../src/runtime/writing-os-runtime';

describe('Phase 3E — Unified Writing OS Runtime Integration', () => {
  const runtime = new WritingOSRuntime();

  it('successfully initializes WritingOSRuntime with full ledger grounding', () => {
    expect(runtime).toBeDefined();
  });

  it('processes Nonfiction documents with accurate epistemic reports', () => {
    const request: WritingOSRequest = {
      documentId: 'DOC-NF-001',
      mode: 'NONFICTION',
      register: 'ENVIRONMENTAL',
      text: 'Human activities have unequivocally caused global warming with temperatures reaching 1.1°C above pre-industrial baselines.',
      assertions: [
        {
          text: 'Human activities caused 1.1C warming.',
          claimId: 'CLM-NF-0001',
          assertionType: 'ATTRIBUTED_ASSERTION',
          statedCausality: 'DETERMINISTIC',
          attributedSourceId: 'SRC-NF-0001',
        },
      ],
    };

    const response = runtime.processDocument(request);
    expect(response.status).toBe('ACCEPTED');
    expect(response.mode).toBe('NONFICTION');
    expect(response.nonfictionReport).toBeDefined();
    expect(response.nonfictionReport!.valid).toBe(true);
    expect(response.overallScore).toBe(1.0);
    expect(response.metrics.wordCount).toBeGreaterThan(0);
  });

  it('rejects Nonfiction documents containing fatal hallucinations', () => {
    const request: WritingOSRequest = {
      documentId: 'DOC-NF-002',
      mode: 'NONFICTION',
      register: 'LEGAL',
      text: 'Quantum micro-arbitrage directly mandates corporate liquidations under article 12.',
      assertions: [
        {
          text: 'Quantum micro-arbitrage mandates liquidations.',
          claimId: 'CLM-NF-HALLUCINATION-X',
          assertionType: 'DIRECT_ASSERTION',
        },
      ],
    };

    const response = runtime.processDocument(request);
    expect(response.status).toBe('REJECTED');
    expect(response.nonfictionReport!.valid).toBe(false);
    expect(response.nonfictionReport!.violations.length).toBeGreaterThan(0);
  });

  it('processes Fiction documents seamlessly adhering to Phase 2B invariants', () => {
    const request: WritingOSRequest = {
      documentId: 'DOC-FIC-001',
      mode: 'FICTION',
      register: 'LITERARY_FICTION',
      text: 'The lantern flickered against the damp stone corridor as Maeve reached for the rusted latch.',
      stateContext: {
        location: 'Old Watchtower',
        charactersPresent: ['Maeve'],
        inventory: ['Lantern', 'Iron Key'],
      },
      inventionPolicy: 'CONSERVATIVE',
    };

    const response = runtime.processDocument(request);
    expect(response.status).toBe('ACCEPTED');
    expect(response.mode).toBe('FICTION');
    expect(response.fictionReport).toBeDefined();
    expect(response.fictionReport!.semanticTriage).toBe('PASS');
    expect(response.overallScore).toBe(1.0);
  });

  it('handles bilingual / cross-register requests cleanly', () => {
    const requestVi: WritingOSRequest = {
      documentId: 'DOC-FIC-VI-001',
      mode: 'FICTION',
      register: 'COMMERCIAL_NOVEL_VI',
      text: 'Ngọn đèn dầu chập chờn rọi lên bức tường đá ẩm ướt khi nàng đưa tay chạm vào then cửa.',
    };

    const responseVi = runtime.processDocument(requestVi);
    expect(responseVi.status).toBe('ACCEPTED');
    expect(responseVi.register).toBe('COMMERCIAL_NOVEL_VI');
    expect(responseVi.metrics.wordCount).toBeGreaterThan(0);
  });
});
