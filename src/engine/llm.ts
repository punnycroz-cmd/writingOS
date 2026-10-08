// src/engine/llm.ts — Provider-agnostic LLM client (OpenAI-compatible).
//
// All [LJ] stages go through this module. Provider is selected by env vars:
//   LLM_BASE_URL  — OpenAI-compatible endpoint (default: OpenRouter)
//   LLM_API_KEY   — required
//   LLM_MODEL     — model id (default: a free OpenRouter model)
//   LLM_MAX_TOKENS — optional, default 4000
//
// EXECUTION_ERROR is returned on failure — callers must never silently
// substitute a heuristic result.

export interface LLMResult {
  content: string;
  mode: 'LLM' | 'EXECUTION_ERROR';
  error?: string;
  latencyMs?: number;
  model?: string;
}

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
// Free-tier default; override with LLM_MODEL for production quality.
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export function llmConfig() {
  return {
    baseUrl: process.env.LLM_BASE_URL || DEFAULT_BASE_URL,
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || DEFAULT_MODEL,
    maxTokens: Number(process.env.LLM_MAX_TOKENS || 4000),
  };
}

export function llmConfigured(): boolean {
  return !!llmConfig().apiKey;
}

export async function llmChat(
  system: string,
  user: string,
  opts: { maxRetries?: number; maxTokens?: number } = {},
): Promise<LLMResult> {
  const cfg = llmConfig();
  const maxRetries = opts.maxRetries ?? 3;
  const startTime = Date.now();
  let lastError = '';

  if (!cfg.apiKey) {
    return { content: '', mode: 'EXECUTION_ERROR', error: 'LLM_API_KEY is not set', latencyMs: 0, model: cfg.model };
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: opts.maxTokens ?? cfg.maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        lastError = `HTTP ${response.status}: ${body.slice(0, 200)}`;
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 10000 * Math.pow(2, attempt)));
          continue;
        }
        return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, model: cfg.model };
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) {
        lastError = 'Empty response';
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 5000)); continue; }
        return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, model: cfg.model };
      }
      return { content, mode: 'LLM', latencyMs: Date.now() - startTime, model: cfg.model };
    } catch (e: any) {
      lastError = String(e?.message || e);
      if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 10000 * Math.pow(2, attempt))); continue; }
      return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, model: cfg.model };
    }
  }
  return { content: '', mode: 'EXECUTION_ERROR', error: lastError || 'max retries', latencyMs: Date.now() - startTime, model: cfg.model };
}

// Robust JSON extraction (models sometimes wrap in ```json or add prose)
export function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  // Tolerate truncated output: close unbalanced braces
  if (first >= 0) {
    let partial = text.slice(first);
    const opens = (partial.match(/{/g) || []).length;
    const closes = (partial.match(/}/g) || []).length;
    if (opens > closes) { partial += '}'.repeat(opens - closes); try { return JSON.parse(partial); } catch {} }
  }
  throw new Error('Could not parse JSON from LLM output: ' + text.slice(0, 300));
}
