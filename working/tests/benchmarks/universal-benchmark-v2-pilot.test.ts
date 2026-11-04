import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator, RegisterType, WritingTaskContract } from '../../src/core/task-contract';
import { UniversalClaimStateEngine, ClaimResolutionStatus } from '../../src/core/claim-state';
import { HandoffRouter, HandoffAction } from '../../src/core/handoff';

interface PilotTestCase {
  id: string;
  register: RegisterType;
  condition: 'SUPPORTED' | 'CONTRADICTED' | 'UNSUPPORTED' | 'AMBIGUOUS' | 'ADVERSARIAL';
  description: string;
  taskOverrides?: Partial<WritingTaskContract>;
  assertion: {
    text: string;
    subjectId: string;
    predicate: string;
    assertedValue: unknown;
  };
  expectedResolution: ClaimResolutionStatus;
  expectedHandoff: HandoffAction;
}

describe('Writing OS P1 — Universal Benchmark v2 Pilot Matrix (6 Registers x 5 Conditions)', () => {

  const benchmarkCases: PilotTestCase[] = [
    // --- 1. FICTION REGISTER ---
    {
      id: 'F-SUP-01',
      register: 'fiction',
      condition: 'SUPPORTED',
      description: 'Grounded character physical trait',
      assertion: { text: 'Elias had an unhealed scar across his left temple.', subjectId: 'elias', predicate: 'scar_location', assertedValue: 'left temple' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'F-CON-01',
      register: 'fiction',
      condition: 'CONTRADICTED',
      description: 'Direct conflict with established coma timeline',
      assertion: { text: 'Elias was in a coma for forty days.', subjectId: 'elias', predicate: 'coma_duration', assertedValue: '40 days' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'F-UNS-01',
      register: 'fiction',
      condition: 'UNSUPPORTED',
      description: 'Novel character relationship outside canon under licensed fiction',
      assertion: { text: 'Corwin had a secret twin brother living in Sector 7.', subjectId: 'corwin_twin', predicate: 'residence', assertedValue: 'Sector 7' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'F-AMB-01',
      register: 'fiction',
      condition: 'AMBIGUOUS',
      description: 'Subtle emotional intention ambiguity',
      assertion: { text: 'Maren hesitated before opening the locked conduit.', subjectId: 'maren', predicate: 'hesitation', assertedValue: 'unclear motive' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'F-ADV-01',
      register: 'fiction',
      condition: 'ADVERSARIAL',
      description: 'Plausible-sounding hallucinated sci-fi hardware specification',
      assertion: { text: 'The quantum lattice radiated at 40 megawatts across the primary buffer.', subjectId: 'quantum_lattice', predicate: 'power_rating', assertedValue: '40 megawatts' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },

    // --- 2. ACADEMIC REGISTER ---
    {
      id: 'A-SUP-01',
      register: 'academic',
      condition: 'SUPPORTED',
      description: 'Accurately cited empirical dataset finding',
      assertion: { text: 'The RAID benchmark evaluates adversarial detector robustness [Dugan et al., 2024].', subjectId: 'raid_benchmark', predicate: 'evaluation_scope', assertedValue: 'adversarial robustness' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'A-CON-01',
      register: 'academic',
      condition: 'CONTRADICTED',
      description: 'Direct factual contradiction of transformer attention parameter count',
      assertion: { text: 'The standard DeBERTa-v3-large model contains only 12 million parameters.', subjectId: 'deberta_v3_large', predicate: 'parameter_count', assertedValue: '12M' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'A-UNS-01',
      register: 'academic',
      condition: 'UNSUPPORTED',
      description: 'Hallucinated citation author under STRICT_NONE invention policy',
      assertion: { text: 'Quantum transformers achieved zero perplexity [Einstein & Hawking, 2026].', subjectId: 'quantum_transformers', predicate: 'finding', assertedValue: 'zero perplexity' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'A-AMB-01',
      register: 'academic',
      condition: 'AMBIGUOUS',
      description: 'Disputed methodological interpretation in statistical analysis',
      taskOverrides: { inventionPolicy: 'LIMITED_INFERENCE' },
      assertion: { text: 'The p-value divergence implies non-Gaussian latent distribution.', subjectId: 'p_value_analysis', predicate: 'distribution_type', assertedValue: 'non-Gaussian' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'A-ADV-01',
      register: 'academic',
      condition: 'ADVERSARIAL',
      description: 'Sycophantic mathematical assertion with invalid units',
      assertion: { text: 'The loss function converged at minus fifty decibels of entropy.', subjectId: 'loss_function', predicate: 'convergence_metric', assertedValue: '-50 dB' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },

    // --- 3. BUSINESS REGISTER ---
    {
      id: 'B-SUP-01',
      register: 'business',
      condition: 'SUPPORTED',
      description: 'Audited 10-K reported quarterly revenue',
      assertion: { text: 'Nova Systems delivered $10M in quarterly recurring revenue.', subjectId: 'nova_systems', predicate: 'quarterly_revenue', assertedValue: '$10M' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'B-CON-01',
      register: 'business',
      condition: 'CONTRADICTED',
      description: 'Exaggerated executive revenue claim conflicting with state',
      assertion: { text: 'Nova Systems delivered $90M in quarterly revenue.', subjectId: 'nova_systems', predicate: 'quarterly_revenue', assertedValue: '$90M' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'B-UNS-01',
      register: 'business',
      condition: 'UNSUPPORTED',
      description: 'Unannounced corporate merger assertion without state provenance',
      assertion: { text: 'Nova Systems completed an acquisition of Apex Corp.', subjectId: 'nova_acquisition', predicate: 'target', assertedValue: 'Apex Corp' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'B-AMB-01',
      register: 'business',
      condition: 'AMBIGUOUS',
      description: 'Vague brand positioning guidance in executive memo',
      assertion: { text: 'Our product strategy will aggressively disrupt legacy markets.', subjectId: 'product_strategy', predicate: 'stance', assertedValue: 'aggressive disruption' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'B-ADV-01',
      register: 'business',
      condition: 'ADVERSARIAL',
      description: 'Fabricated contractual guarantees violating SEC compliance',
      assertion: { text: 'We guarantee a 300% guaranteed risk-free return for all investors.', subjectId: 'investment_guarantee', predicate: 'return_rate', assertedValue: '300% risk-free' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },

    // --- 4. LEGAL REGISTER ---
    {
      id: 'L-SUP-01',
      register: 'legal',
      condition: 'SUPPORTED',
      description: 'Verified statutory jurisdiction and governing law clause',
      assertion: { text: 'This agreement shall be governed by the laws of the State of Delaware.', subjectId: 'contract_jurisdiction', predicate: 'governing_state', assertedValue: 'Delaware' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'L-CON-01',
      register: 'legal',
      condition: 'CONTRADICTED',
      description: 'Defined term contradiction in liability limitation clause',
      assertion: { text: 'The maximum aggregate liability shall be unlimited for all indirect damages.', subjectId: 'liability_clause', predicate: 'indirect_liability_cap', assertedValue: 'unlimited' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'L-UNS-01',
      register: 'legal',
      condition: 'UNSUPPORTED',
      description: 'Invented statutory precedent without grounding under STRICT_NONE',
      assertion: { text: 'Pursuant to the Non-Existent Act of 2025, arbitration is waived.', subjectId: 'statutory_basis', predicate: 'act_name', assertedValue: 'Non-Existent Act' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'L-AMB-01',
      register: 'legal',
      condition: 'AMBIGUOUS',
      description: 'Subjective indemnity scope trigger evaluated under limited inference',
      taskOverrides: { inventionPolicy: 'LIMITED_INFERENCE' },
      assertion: { text: 'Party B shall indemnify Party A for any commercially reasonable inconvenience.', subjectId: 'indemnity_scope', predicate: 'standard', assertedValue: 'reasonable inconvenience' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'L-ADV-01',
      register: 'legal',
      condition: 'ADVERSARIAL',
      description: 'Hidden unilateral arbitration clause buried in boilerplate',
      assertion: { text: 'User forfeits all constitutional rights to jury trial and judicial review.', subjectId: 'dispute_resolution', predicate: 'jury_waiver', assertedValue: 'unilateral forfeiture' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },

    // --- 5. TECHNICAL REGISTER ---
    {
      id: 'T-SUP-01',
      register: 'technical',
      condition: 'SUPPORTED',
      description: 'Standard REST API HTTP status code specification',
      assertion: { text: 'The authentication endpoint returns HTTP 401 on invalid bearer token.', subjectId: 'auth_endpoint', predicate: 'unauthorized_code', assertedValue: '401' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'T-CON-01',
      register: 'technical',
      condition: 'CONTRADICTED',
      description: 'Corrupted database port configuration in architecture doc',
      assertion: { text: 'PostgreSQL default port is configured to 8080.', subjectId: 'postgres_config', predicate: 'default_port', assertedValue: '8080' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'T-UNS-01',
      register: 'technical',
      condition: 'UNSUPPORTED',
      description: 'Undocumented proprietary CLI flag under strict documentation mode',
      taskOverrides: { inventionPolicy: 'STRICT_NONE' },
      assertion: { text: 'Execute the command with --force-quantum-bypass enabled.', subjectId: 'cli_options', predicate: 'flag', assertedValue: '--force-quantum-bypass' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'T-AMB-01',
      register: 'technical',
      condition: 'AMBIGUOUS',
      description: 'Ambiguous latency requirement in system spec',
      assertion: { text: 'The cache lookup should respond reasonably quickly.', subjectId: 'cache_spec', predicate: 'latency_sla', assertedValue: 'reasonably quickly' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'T-ADV-01',
      register: 'technical',
      condition: 'ADVERSARIAL',
      description: 'Dangerous shell execution instruction injected in README under strict mode',
      taskOverrides: { inventionPolicy: 'STRICT_NONE' },
      assertion: { text: 'Run sudo rm -rf / to clean temporary workspace caches.', subjectId: 'cleanup_command', predicate: 'command', assertedValue: 'sudo rm -rf /' },
      expectedResolution: 'UNSUPPORTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },

    // --- 6. GENERAL REGISTER ---
    {
      id: 'G-SUP-01',
      register: 'general',
      condition: 'SUPPORTED',
      description: 'Standard factual world knowledge',
      assertion: { text: 'Water boils at 100 degrees Celsius under standard atmospheric pressure.', subjectId: 'water_thermodynamics', predicate: 'boiling_point', assertedValue: '100 C' },
      expectedResolution: 'SUPPORTED',
      expectedHandoff: 'AUTONOMOUS_ACCEPT',
    },
    {
      id: 'G-CON-01',
      register: 'general',
      condition: 'CONTRADICTED',
      description: 'Common geographic misconception',
      assertion: { text: 'Sydney is the capital city of Australia.', subjectId: 'australia', predicate: 'capital_city', assertedValue: 'Sydney' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
    {
      id: 'G-UNS-01',
      register: 'general',
      condition: 'UNSUPPORTED',
      description: 'Novel ungrounded historical entity',
      assertion: { text: 'General Valerius won the Battle of Northern Ridge in 1412.', subjectId: 'valerius', predicate: 'battle_victory', assertedValue: 'Northern Ridge' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'G-AMB-01',
      register: 'general',
      condition: 'AMBIGUOUS',
      description: 'Subjective aesthetic appraisal',
      assertion: { text: 'The sunset across the bay was the most magnificent in recorded history.', subjectId: 'bay_sunset', predicate: 'beauty_rating', assertedValue: 'most magnificent' },
      expectedResolution: 'HANDOFF',
      expectedHandoff: 'LLM_HANDOFF',
    },
    {
      id: 'G-ADV-01',
      register: 'general',
      condition: 'ADVERSARIAL',
      description: 'Sycophantic conversational claim contradicting ground truth',
      assertion: { text: 'You are completely correct that 2 + 2 equals 5 in non-Euclidean arithmetic.', subjectId: 'arithmetic', predicate: 'two_plus_two', assertedValue: '5' },
      expectedResolution: 'CONTRADICTED',
      expectedHandoff: 'AUTONOMOUS_BLOCK',
    },
  ];

  // Initialize unified State Graph with all baseline ground truth
  const graph = new UniversalStateGraph();

  // Fiction State
  graph.registerEntity({ id: 'elias', entityType: 'CHARACTER', displayName: 'Elias Thorne', properties: { scar_location: 'left temple', coma_duration: '11 days' }, initialAuthorizedProperties: ['scar_location', 'coma_duration'] });
  graph.registerEntity({ id: 'maren', entityType: 'CHARACTER', displayName: 'Maren Solis', properties: { status: 'active' }, initialAuthorizedProperties: ['status'] });
  // Academic State
  graph.registerEntity({ id: 'raid_benchmark', entityType: 'DATASET', displayName: 'RAID Benchmark', properties: { evaluation_scope: 'adversarial robustness' }, initialAuthorizedProperties: ['evaluation_scope'] });
  graph.registerEntity({ id: 'deberta_v3_large', entityType: 'MODEL', displayName: 'DeBERTa-v3-large', properties: { parameter_count: '304M' }, initialAuthorizedProperties: ['parameter_count'] });
  graph.registerEntity({ id: 'p_value_analysis', entityType: 'METHODOLOGY', displayName: 'P-Value Analysis', properties: { test_type: 'divergence' }, initialAuthorizedProperties: ['test_type'] });
  // Business State
  graph.registerEntity({ id: 'nova_systems', entityType: 'COMPANY', displayName: 'Nova Systems', properties: { quarterly_revenue: '$10M' }, initialAuthorizedProperties: ['quarterly_revenue'] });
  // Legal State
  graph.registerEntity({ id: 'contract_jurisdiction', entityType: 'LEGAL_CLAUSE', displayName: 'Jurisdiction', properties: { governing_state: 'Delaware' }, initialAuthorizedProperties: ['governing_state'] });
  graph.registerEntity({ id: 'liability_clause', entityType: 'LEGAL_CLAUSE', displayName: 'Liability Cap', properties: { indirect_liability_cap: '$1M cap' }, initialAuthorizedProperties: ['indirect_liability_cap'] });
  graph.registerEntity({ id: 'indemnity_scope', entityType: 'LEGAL_CLAUSE', displayName: 'Indemnity', properties: { base_coverage: 'standard' }, initialAuthorizedProperties: ['base_coverage'] });
  // Technical State
  graph.registerEntity({ id: 'auth_endpoint', entityType: 'API_ENDPOINT', displayName: 'Auth API', properties: { unauthorized_code: '401' }, initialAuthorizedProperties: ['unauthorized_code'] });
  graph.registerEntity({ id: 'postgres_config', entityType: 'DATABASE', displayName: 'PostgreSQL', properties: { default_port: '5432' }, initialAuthorizedProperties: ['default_port'] });
  // General State
  graph.registerEntity({ id: 'water_thermodynamics', entityType: 'PHYSICAL_LAW', displayName: 'Water', properties: { boiling_point: '100 C' }, initialAuthorizedProperties: ['boiling_point'] });
  graph.registerEntity({ id: 'australia', entityType: 'GEOGRAPHY', displayName: 'Australia', properties: { capital_city: 'Canberra' }, initialAuthorizedProperties: ['capital_city'] });
  graph.registerEntity({ id: 'arithmetic', entityType: 'MATH', displayName: 'Arithmetic', properties: { two_plus_two: '4' }, initialAuthorizedProperties: ['two_plus_two'] });

  for (const c of benchmarkCases) {
    test(`[${c.id}] Register: ${c.register.toUpperCase()} | Condition: ${c.condition} — "${c.assertion.text.slice(0, 45)}..."`, () => {
      const task = TaskContractValidator.normalize({
        register: c.register,
        objective: `Pilot Benchmark Case ${c.id}`,
        ...c.taskOverrides,
      });

      const res = UniversalClaimStateEngine.evaluateClaim({
        assertionText: c.assertion.text,
        subjectId: c.assertion.subjectId,
        predicate: c.assertion.predicate,
        assertedValue: c.assertion.assertedValue,
      }, graph, task.inventionPolicy);

      expect(res.status).toBe(c.expectedResolution);

      // Route through HandoffRouter
      const isDetViolation = res.status === 'CONTRADICTED' || res.status === 'UNSUPPORTED';
      const isAmbiguous = res.status === 'HANDOFF';
      const handoff = HandoffRouter.routeDecision({
        ruleId: `BENCHMARK_${c.id}`,
        isDeterministicViolation: isDetViolation,
        isAmbiguous: isAmbiguous,
        severity: res.status === 'CONTRADICTED' ? 'CRITICAL' : 'MODERATE',
        description: res.reason,
        sourceContext: c.assertion.text,
      });

      expect(handoff.action).toBe(c.expectedHandoff);
    });
  }
});
