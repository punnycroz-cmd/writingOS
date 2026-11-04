import { describe, expect, test } from 'bun:test';
import { ReleaseConformanceV1 } from '../../src/core/release-conformance-v1';

describe('Writing OS P29 — Release Conformance & Package Suite (v1.0.0)', () => {

  describe('1. 5-Track Release Conformance Verification', () => {
    test('Verifies all 5 formal release conformance tracks pass successfully', () => {
      const track1 = ReleaseConformanceV1.verifyConstitutionConformance();
      expect(track1.passed).toBe(true);
      expect(track1.checkedItemsCount).toBe(13); // 8 articles + 2 charters + 3 exceptions

      const track2 = ReleaseConformanceV1.verifyGovernanceConformance();
      expect(track2.passed).toBe(true);
      expect(track2.checkedItemsCount).toBe(2);

      const track3 = ReleaseConformanceV1.verifyBibleConformance();
      expect(track3.passed).toBe(true);
      expect(track3.checkedItemsCount).toBe(16); // 10 parts + 6 v4 concepts

      const track4 = ReleaseConformanceV1.verifySecuritySafetyConformance();
      expect(track4.passed).toBe(true);
      expect(track4.checkedItemsCount).toBe(4);

      const track5 = ReleaseConformanceV1.verifyEvidenceClaimConformance();
      expect(track5.passed).toBe(true);
      expect(track5.checkedItemsCount).toBe(10);
    });
  });

  describe('2. Release Manifest Generation & Integrity', () => {
    test('Compiles a complete Release Manifest with all 6 register packs and declared limitations', () => {
      const manifest = ReleaseConformanceV1.generateReleaseManifest();

      expect(manifest.product.name).toBe('Writing OS');
      expect(manifest.product.version).toBe('1.0.0');
      expect(manifest.product.status).toBe('PRODUCTION_RELEASE_READY');

      expect(manifest.constitution.version).toBe('1.0.0');
      expect(manifest.constitution.articlesCount).toBe(8);

      expect(manifest.bible.version).toBe('5.0.0');
      expect(manifest.bible.totalParts).toBe(10);

      expect(manifest.evidenceRegistry.totalPhasesTraceable).toBe(29);
      expect(manifest.registerPacks.length).toBe(6);

      expect(manifest.conformanceStatus.allTracksPassed).toBe(true);
      expect(manifest.conformanceStatus.conformanceTracks.length).toBe(5);
    });
  });

  describe('3. Fixture Role Lock (final.txt)', () => {
    test('Confirms final.txt is non-authoritative and not a release gate', () => {
      const manifest = ReleaseConformanceV1.generateReleaseManifest();
      const fixture = manifest.fixtures.find(f => f.fixtureId === 'final.txt');

      expect(fixture).toBeDefined();
      expect(fixture?.artifactType).toBe('FICTION_STRESS_FIXTURE');
      expect(fixture?.governingAuthority).toBe('NON_AUTHORITATIVE_OBSERVATIONAL_FIXTURE');
    });
  });

  describe('4. Known Limitations Formal Disclosure', () => {
    test('Discloses all 3 operational boundaries with active mitigations', () => {
      const manifest = ReleaseConformanceV1.generateReleaseManifest();

      expect(manifest.knownLimitations.length).toBe(3);
      const limitIds = manifest.knownLimitations.map(l => l.limitationId);

      expect(limitIds).toContain('LIMIT_001_LONG_HORIZON_COREF');
      expect(limitIds).toContain('LIMIT_002_DOMAIN_CALIBRATION_DRIFT');
      expect(limitIds).toContain('LIMIT_003_POETIC_AMBIGUITY');
    });
  });
});
