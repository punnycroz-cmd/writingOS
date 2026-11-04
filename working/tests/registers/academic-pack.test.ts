import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { AcademicPack, AcademicSourceGraph } from '../../src/registers/academic-pack';

describe('Writing OS Registers — Academic Pack Specification', () => {
  test('Flags hallucinated citations not found in the Academic Source Graph', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'academic', objective: 'Literature review' });
    const pack = new AcademicPack();

    AcademicSourceGraph.registerSource(graph, {
      id: 'Vaswani et al., 2017',
      title: 'Attention Is All You Need',
      authors: ['Vaswani', 'Shazeer', 'Parmar'],
      year: 2017,
      keyFindings: ['Transformer architecture'],
    });

    const candidateText = 'Recent advances in self-attention mechanisms [Vaswani et al., 2017] demonstrated state-of-the-art results, whereas [Johnson et al., 2026] claimed quantum supremacy.';
    const audit = pack.auditText(candidateText, graph, task);

    expect(audit.passed).toBe(false);
    expect(audit.violations[0]).toContain('Hallucinated Citation: Citation "[Johnson et al., 2026]"');
  });

  test('Flags informal colloquialisms in academic writing', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'academic', objective: 'Methodology' });
    const pack = new AcademicPack();

    const informalText = 'In this paper, we are gonna prove that the proposed algorithm is super cool.';
    const audit = pack.auditText(informalText, graph, task);

    expect(audit.passed).toBe(false);
    expect(audit.violations[0]).toContain('Register Tone Violation: Informal colloquialisms');
  });
});
