/**
 * Writing OS Core — Entity Property Authorization Layer
 * Enforces the core invariant: Entity Existence != Property Authorization across all registers.
 */

import { UniversalStateGraph } from './state-model';

export interface PropertyAuthorizationQuery {
  entityId: string;
  propertyName: string;
  purportedValue?: unknown;
  accessingContext: string; // e.g. 'CHARACTER_CONSCIOUSNESS', 'EXECUTIVE_BRIEF', 'CITING_PAPER'
}

export interface PropertyAuthorizationDecision {
  isAuthorized: boolean;
  entityId: string;
  propertyName: string;
  establishedValue?: unknown;
  violationReason?: string;
  recommendation: 'ALLOW' | 'BLOCK' | 'REDACT' | 'FLAG_FOR_HANDOFF';
}

export class EntityPropertyAuthorizer {
  public static authorize(
    query: PropertyAuthorizationQuery,
    stateGraph: UniversalStateGraph
  ): PropertyAuthorizationDecision {
    const entity = stateGraph.getEntity(query.entityId);

    // 1. Entity Existence Check
    if (!entity) {
      return {
        isAuthorized: false,
        entityId: query.entityId,
        propertyName: query.propertyName,
        violationReason: `Entity "${query.entityId}" does not exist in state. Cannot authorize properties for non-existent entities.`,
        recommendation: 'BLOCK',
      };
    }

    // 2. Explicit Unknown Check
    if (stateGraph.isUnknown(query.entityId) || stateGraph.isUnknown(`${query.entityId}.${query.propertyName}`)) {
      return {
        isAuthorized: false,
        entityId: query.entityId,
        propertyName: query.propertyName,
        violationReason: `Entity property "${query.entityId}.${query.propertyName}" is declared UNKNOWN. Access in "${query.accessingContext}" is an unauthorized state leak.`,
        recommendation: 'BLOCK',
      };
    }

    // 3. Authorized Property Set Check
    if (!entity.authorizedProperties.has(query.propertyName)) {
      return {
        isAuthorized: false,
        entityId: query.entityId,
        propertyName: query.propertyName,
        violationReason: `Entity "${query.entityId}" exists, but property "${query.propertyName}" is unauthorized. (Entity Existence != Property Authorization).`,
        recommendation: 'FLAG_FOR_HANDOFF',
      };
    }

    const propRecord = entity.properties.get(query.propertyName);
    const value = propRecord ? propRecord.value : undefined;
    if (query.purportedValue !== undefined) {
      const v1 = String(value).trim().toLowerCase();
      const v2 = String(query.purportedValue).trim().toLowerCase();
      if (v1 !== v2) {
        return {
          isAuthorized: false,
          entityId: query.entityId,
          propertyName: query.propertyName,
          establishedValue: value,
          violationReason: `Property value mismatch on "${query.entityId}.${query.propertyName}". State has "${value}", query claimed "${query.purportedValue}".`,
          recommendation: 'BLOCK',
        };
      }
    }

    return {
      isAuthorized: true,
      entityId: query.entityId,
      propertyName: query.propertyName,
      establishedValue: value,
      recommendation: 'ALLOW',
    };
  }
}
