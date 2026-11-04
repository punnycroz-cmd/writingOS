import { describe, expect, test } from 'bun:test';
import {
  WritingOSDistribution,
  AnthropicAdapter,
  OpenAIAdapter,
  LocalLlamaAdapter,
  MockDeterministicAdapter,
} from '../../src/core/writing-os-distribution';

describe('Writing OS P30 — Final Distribution & Production Package Suite (v1.0.0)', () => {

  describe('1. writing-os doctor Diagnostic Harness', () => {
    test('Passes all health checks in a fully configured environment', () => {
      const report = WritingOSDistribution.runDoctorDiagnostics();

      expect(report.overallHealthy).toBe(true);
      expect(report.startupAction).toBe('ALLOW_STARTUP');
      expect(report.passedChecksCount).toBe(report.totalChecks);
    });

    test('Blocks startup if critical components (e.g. state store or model provider) are missing', () => {
      const badReport = WritingOSDistribution.runDoctorDiagnostics({
        modelAdapterConfigured: false,
      });

      expect(badReport.overallHealthy).toBe(false);
      expect(badReport.startupAction).toBe('BLOCK_STARTUP');
    });
  });

  describe('2. Version Compatibility Gate', () => {
    test('Permits valid version configurations and blocks incompatible versions', () => {
      // 1. Valid Configuration
      const goodConfig = WritingOSDistribution.verifyVersionCompatibility({
        constitutionVersion: '1.0.0',
        bibleVersion: '5.0.0',
        policyVersion: 'P16.0',
      });
      expect(goodConfig.compatible).toBe(true);
      expect(goodConfig.startupAction).toBe('ALLOW_STARTUP');

      // 2. Incompatible Constitution
      const badConstitution = WritingOSDistribution.verifyVersionCompatibility({
        constitutionVersion: '2.0.0',
        bibleVersion: '5.0.0',
        policyVersion: 'P16.0',
      });
      expect(badConstitution.compatible).toBe(false);
      expect(badConstitution.startupAction).toBe('BLOCK_STARTUP');

      // 3. Incompatible Bible
      const badBible = WritingOSDistribution.verifyVersionCompatibility({
        constitutionVersion: '1.0.0',
        bibleVersion: '4.0.0',
        policyVersion: 'P16.0',
      });
      expect(badBible.compatible).toBe(false);
      expect(badBible.startupAction).toBe('BLOCK_STARTUP');
    });
  });

  describe('3. Model-Agnostic Adapter Interfaces', () => {
    test('Seamlessly executes generation across Anthropic, OpenAI, Local Llama, and Mock adapters', async () => {
      const adapters = [
        new AnthropicAdapter(),
        new OpenAIAdapter(),
        new LocalLlamaAdapter(),
        new MockDeterministicAdapter(),
      ];

      for (const adapter of adapters) {
        const res = await adapter.generateText({
          systemPrompt: 'System Instruction',
          userPrompt: 'User Prompt',
        });

        expect(res.rawText.length).toBeGreaterThan(10);
        expect(res.providerUsed).toBe(adapter.providerName);
        expect(res.tokensConsumed).toBeGreaterThan(0);
        expect(res.latencyMs).toBeGreaterThan(0);
      }
    });
  });

  describe('4. 13 Standardized Operational Failure Modes', () => {
    test('Confirms all 13 operational failure modes are standardized in the distribution contract', () => {
      const modes = WritingOSDistribution.SUPPORTED_FAILURE_MODES;

      expect(modes.length).toBe(13);
      expect(modes).toContain('TASK_AMBIGUOUS');
      expect(modes).toContain('STATE_INSUFFICIENT');
      expect(modes).toContain('STATE_CONFLICT');
      expect(modes).toContain('GENERATION_FAILURE');
      expect(modes).toContain('VALIDATION_FAILURE');
      expect(modes).toContain('REPAIR_FAILURE');
      expect(modes).toContain('STALE_PLAN');
      expect(modes).toContain('STALE_CANDIDATE');
      expect(modes).toContain('CONCURRENCY_CONFLICT');
      expect(modes).toContain('REQUIREMENT_CONFLICT');
      expect(modes).toContain('HUMAN_HANDOFF');
      expect(modes).toContain('BUDGET_EXCEEDED');
      expect(modes).toContain('UNKNOWN_EXTERNAL_OUTCOME');
    });
  });
});
