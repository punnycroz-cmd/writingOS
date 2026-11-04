/**
 * Writing OS Core — Model Provider Failure & Distributed Retry Protocol (P14)
 * Explicitly categorizes provider failure outcomes into SAFE_RETRY, UNSAFE_STALE_RETRY, and UNKNOWN_EXTERNAL_OUTCOME.
 */

export type ProviderFailureType = 'RATE_LIMIT_429' | 'SERVER_ERROR_503' | 'TIMEOUT_DISCONNECT' | 'MALFORMED_JSON_STREAM';

export interface ProviderFailureClassification {
  failureType: ProviderFailureType;
  retryAction: 'SAFE_RETRY' | 'UNSAFE_STALE_RETRY' | 'UNKNOWN_EXTERNAL_OUTCOME';
  shouldRevalidateState: boolean;
  explanation: string;
}

export class ProviderFailureProtocol {
  public static classifyProviderFailure(
    failureType: ProviderFailureType,
    initialStateVersion: number,
    currentStateVersion: number,
    candidatePartiallyCommitted: boolean
  ): ProviderFailureClassification {
    // 1. If state has mutated since request start, blind retry is UNSAFE!
    if (currentStateVersion > initialStateVersion) {
      return {
        failureType,
        retryAction: 'UNSAFE_STALE_RETRY',
        shouldRevalidateState: true,
        explanation: `State version drifted from v${initialStateVersion} to v${currentStateVersion}. Blind retry blocked to prevent stale state hallucination.`,
      };
    }

    // 2. If a candidate was partially generated or committed when disconnect occurred
    if (candidatePartiallyCommitted || failureType === 'TIMEOUT_DISCONNECT') {
      return {
        failureType,
        retryAction: 'UNKNOWN_EXTERNAL_OUTCOME',
        shouldRevalidateState: true,
        explanation: 'Network disconnect occurred with uncertain external execution. Requires status verification before re-issuing billable model call.',
      };
    }

    // 3. Transient rate limit or 503 before any side effect occurred
    return {
      failureType,
      retryAction: 'SAFE_RETRY',
      shouldRevalidateState: false,
      explanation: 'Transient provider fault before candidate generation. Safe to retry with exponential backoff.',
    };
  }
}
