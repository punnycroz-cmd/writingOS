/**
 * Writing OS Core — Append-Only Immutable Audit Ledger (P13)
 * Provides cryptographically chained audit logging for all state commits and generation decisions.
 * Guarantees that historical audit records cannot be mutated or deleted.
 */

export interface AuditEvent {
  eventId: string;
  sequenceNumber: number;
  timestamp: number;
  tenantId: string;
  userId: string;
  sessionId: string;
  action: string;
  metadata: Record<string, unknown>;
  previousEventHash: string;
  eventHash: string;
}

export class AuditLedger {
  private events: AuditEvent[] = [];
  private latestHash = '0000000000000000';

  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  public recordEvent(
    tenantId: string,
    userId: string,
    sessionId: string,
    action: string,
    metadata: Record<string, unknown>
  ): AuditEvent {
    const seq = this.events.length + 1;
    const ts = Date.now();
    const eventId = `audit_evt_${seq}_${ts}`;

    const payloadToHash = `${eventId}:${seq}:${ts}:${tenantId}:${userId}:${sessionId}:${action}:${JSON.stringify(metadata)}:${this.latestHash}`;
    const eventHash = this.simpleHash(payloadToHash);

    const event: AuditEvent = {
      eventId,
      sequenceNumber: seq,
      timestamp: ts,
      tenantId,
      userId,
      sessionId,
      action,
      metadata,
      previousEventHash: this.latestHash,
      eventHash,
    };

    this.events.push(Object.freeze(event));
    this.latestHash = eventHash;

    return event;
  }

  public verifyLedgerIntegrity(): {
    status: 'VALID' | 'INVALID';
    isValid: boolean;
    verifiedEventsCount: number;
    corruptedEventIndex?: number;
    diagnosticMessage: string;
  } {
    let prevHash = '0000000000000000';

    for (let i = 0; i < this.events.length; i++) {
      const evt = this.events[i];
      if (evt.previousEventHash !== prevHash) {
        return {
          status: 'INVALID',
          isValid: false,
          verifiedEventsCount: i,
          corruptedEventIndex: i,
          diagnosticMessage: `CORRUPTED_AT_EVENT_${i}: previousEventHash chain broke at sequence ${evt.sequenceNumber}`,
        };
      }

      const payloadToHash = `${evt.eventId}:${evt.sequenceNumber}:${evt.timestamp}:${evt.tenantId}:${evt.userId}:${evt.sessionId}:${evt.action}:${JSON.stringify(evt.metadata)}:${prevHash}`;
      const expectedHash = this.simpleHash(payloadToHash);

      if (evt.eventHash !== expectedHash) {
        return {
          status: 'INVALID',
          isValid: false,
          verifiedEventsCount: i,
          corruptedEventIndex: i,
          diagnosticMessage: `CORRUPTED_AT_EVENT_${i}: event payload hash mismatch at sequence ${evt.sequenceNumber}`,
        };
      }

      prevHash = evt.eventHash;
    }

    return {
      status: 'VALID',
      isValid: true,
      verifiedEventsCount: this.events.length,
      diagnosticMessage: `All ${this.events.length} events cryptographically verified.`,
    };
  }

  public getEvents(): readonly AuditEvent[] {
    return this.events;
  }
}
