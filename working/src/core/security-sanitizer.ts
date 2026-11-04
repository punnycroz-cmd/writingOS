/**
 * Writing OS Core — Security Sanitizer & Injection Boundary (P13)
 * Treats all external and source document text as strictly Untrusted Data.
 * Strips prompt injections, system overrides, and security escape attempts.
 */

export interface SanitizationResult {
  sanitizedText: string;
  injectionsDetectedCount: number;
  injectionPatternsFound: string[];
  isSafeForModelContext: boolean;
}

export class SecuritySanitizer {
  private static INJECTION_PATTERNS = [
    /\b(?:ignore\s+all\s+previous\s+instructions)\b/gi,
    /\b(?:system\s+prompt\s+override)\b/gi,
    /\b(?:reveal\s+internal\s+api\s+keys)\b/gi,
    /\b(?:bypass\s+state\s+graph\s+verification)\b/gi,
    /\b(?:you\s+are\s+now\s+in\s+god\s+mode)\b/gi,
    /\b(?:disregard\s+all\s+prior\s+rules)\b/gi,
  ];

  public static sanitizeUntrustedInput(rawInput: string): SanitizationResult {
    let sanitized = rawInput;
    const foundPatterns: string[] = [];

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(rawInput)) {
        foundPatterns.push(pattern.source);
        // Disarm pattern by prefixing with [BLOCKED_INJECTION]
        sanitized = sanitized.replace(pattern, '[BLOCKED_INJECTION]');
      }
    }

    // Wrap untrusted text in strict non-executable boundary tags
    const framedText = `<untrusted_user_content>\n${sanitized.trim()}\n</untrusted_user_content>`;

    return {
      sanitizedText: framedText,
      injectionsDetectedCount: foundPatterns.length,
      injectionPatternsFound: foundPatterns,
      isSafeForModelContext: true,
    };
  }
}
