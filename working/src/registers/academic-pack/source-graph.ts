/**
 * Academic Pack — Source Graph & Citation Ledger
 * Grounding research papers, methodologies, citations, and claim-evidence alignment.
 */

import { UniversalStateGraph, BaseEntity } from '../../core/state-model';

export interface SourceDocument {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  keyFindings: string[];
}

export class AcademicSourceGraph {
  public static registerSource(stateGraph: UniversalStateGraph, source: SourceDocument): BaseEntity {
    const entity = stateGraph.registerEntity({
      id: source.id,
      entityType: 'ACADEMIC_SOURCE',
      displayName: source.title,
      properties: {
        authors: source.authors,
        year: source.year,
        doi: source.doi || '',
        keyFindings: source.keyFindings,
      },
      initialAuthorizedProperties: ['authors', 'year', 'doi', 'keyFindings'],
    });

    for (const finding of source.keyFindings) {
      stateGraph.registerClaim({
        id: `claim_${source.id}_finding_${Math.random().toString(36).substr(2, 4)}`,
        subjectId: source.id,
        predicate: 'cited_finding',
        objectValue: finding,
        authorityLevel: 'SOURCE_VERIFIED',
      });
    }

    return entity;
  }

  public static auditCitationGrounding(text: string, stateGraph: UniversalStateGraph): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    // Extract [Author, Year] or [Number] citations
    const citationRegex = /\[([A-Za-z]+ et al\., \d{4}|\d+)\]/g;
    let match;

    const registeredSources = stateGraph.getAllEntities().filter(e => e.entityType === 'ACADEMIC_SOURCE');
    const validIds = new Set(registeredSources.map(s => s.id));

    while ((match = citationRegex.exec(text)) !== null) {
      const citeKey = match[1];
      // If citation is not found in source graph
      const found = registeredSources.some(s => s.id === citeKey || (s.properties.get('authors')?.value as string[])?.some(a => citeKey.includes(a)));
      if (!found && registeredSources.length > 0) {
        violations.push(`Hallucinated Citation: Citation "[${citeKey}]" is not grounded in Academic Source Graph.`);
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
