# WRITING OS — DEVELOPER QUICKSTART GUIDE (v1.0.0)

Welcome to **Writing OS v1.0.0**. This guide provides a rapid 10-step walkthrough for initializing, running, and integrating Writing OS into your production applications.

---

## THE 10-STEP LIFECYCLE WALKTHROUGH

```text
[1. Init System] ──> [2. Load Constitution & Bible] ──> [3. Select Register Pack]
                            │
[6. Compile Plan] <── [5. Declare Task Contract] <─── [4. Initialize State Graph]
       │
[7. Route & Generate] ──> [8. Decoupled Validation] ──> [9. Targeted Repair / Handoff]
                                                              │
                                                     [10. Commit & Persist]
```

### Step 1: System Health Check (`writing-os doctor`)
Ensure all subsystem dependencies, state stores, and providers are healthy:
```typescript
import { WritingOSDistribution } from './src/core/writing-os-distribution';

const report = WritingOSDistribution.runDoctorDiagnostics();
if (report.startupAction === 'BLOCK_STARTUP') {
  throw new Error('System diagnostic failed. Please configure required adapters.');
}
console.log('Writing OS Doctor: All checks passed!');
```

### Step 2: Initialize State Graph & Register
```typescript
import { StateStore } from './src/core/state-store';

const store = new StateStore();
store.assertFact('Elias holds the rank of Captain', 'CANON');
store.assertCharacterBelief('Elias', 'Maren is in Sector 4');
```

### Step 3: Define Task Contract & Register Pack
```typescript
import { TaskContractSpecification } from './src/core/task-contract';

const contract = new TaskContractSpecification({
  register: 'FICTION',
  goal: 'Draft scene opening in high-stress command deck',
  entityPreserves: ['Captain Elias'],
  authorizedChangeScope: 'PARAGRAPH_ONLY',
});
```

### Step 4: Execute Generation via Model Adapter
```typescript
import { AnthropicAdapter } from './src/core/writing-os-distribution';

const adapter = new AnthropicAdapter();
const response = await adapter.generateText({
  systemPrompt: 'You are executing Writing OS Fiction Directives.',
  userPrompt: 'Draft scene opening focusing on somatic strain.',
});
```

### Step 5: Independent Dual-Track Validation & Commit
```typescript
// Validation Gate evaluates candidate against Canon state
const isValid = !response.rawText.includes('Elias died in 2042');
if (isValid) {
  store.commitCandidate(response.rawText, contract);
  console.log('Candidate committed successfully under Constitution v1.0!');
} else {
  console.log('Integrity violation detected. Initiating targeted repair.');
}
```
