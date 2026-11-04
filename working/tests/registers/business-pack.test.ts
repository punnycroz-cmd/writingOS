import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { BusinessPack, BusinessBrandEngine } from '../../src/registers/business-pack';

describe('Writing OS Registers — Business Pack Specification', () => {
  test('Flags unverified financial metrics that conflict with authorized company profile', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'business', objective: 'Executive Summary', audience: 'EXECUTIVE' });
    const pack = new BusinessPack();

    BusinessBrandEngine.registerBusinessProfile(graph, {
      companyName: 'Acme Technologies',
      quarterlyRevenue: '$15M',
    });

    // Text claims $50M revenue, which conflicts with $15M
    const candidateText = 'Acme Technologies closed the third quarter with $50M in recurring revenue, exceeding all historical targets.';
    const audit = pack.auditText(candidateText, graph, task);

    expect(audit.passed).toBe(false);
    expect(audit.violations[0]).toContain('Unverified Financial Metric');
  });

  test('Passes cleanly when financial metrics match authorized state', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'business', objective: 'Executive Summary', audience: 'EXECUTIVE' });
    const pack = new BusinessPack();

    BusinessBrandEngine.registerBusinessProfile(graph, {
      companyName: 'Acme Technologies',
      quarterlyRevenue: '$15M',
    });

    const candidateText = 'Acme Technologies closed the third quarter with $15M in recurring revenue, delivering steady operational execution.';
    const audit = pack.auditText(candidateText, graph, task);

    expect(audit.passed).toBe(true);
    expect(audit.violations.length).toBe(0);
  });
});
