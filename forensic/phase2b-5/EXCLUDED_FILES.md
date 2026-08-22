# Excluded Files — Phase 2B.5 Forensic Snapshot

This document lists classes of content EXCLUDED from the forensic snapshot and the
git commit, along with the reason for exclusion and whether a sanitized representation
exists.

## Excluded by policy (NEVER committed)

| Class | Reason | Sanitized representation? |
|---|---|---|
| `.env` | Environment files may contain live API keys, DB URLs, tokens. Gitignored. | No — not relevant to corpus forensics. |
| `.env.*` | Same as above. | No. |
| `credentials/` | Credential directory. Gitignored. | No. |
| `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`, `*.cert` | Private key / certificate files. Gitignored. | No. |
| `service-account files` | Cloud credential files. Gitignored. | No. |
| `token files`, `authentication caches`, `browser cookies`, `session files` | Auth state. Gitignored. | No. |
| `private SSH keys` | SSH credentials. Gitignored. | No. |
| API keys (FIREWORKS_API_KEY, OPENAI_API_KEY, etc.) | Live secrets. The evaluator reads `FIREWORKS_API_KEY` from env at runtime; the value is NEVER committed. | No — not needed; the code references the env var by name only. |
| GitHub PATs (`github_pat_`, `ghp_`, `gho_`) | Git push credentials. | No. |
| OAuth secrets, refresh tokens, access tokens | Auth tokens. | No. |
| `.zscripts/` | Sandbox-private orchestration scripts. Gitignored. | No. |
| `.z-ai-config/` | Sandbox-private config. Gitignored. | No. |
| `node_modules/` | Dependency tree (regenerable from package.json + bun.lock). Gitignored. | Recorded as "node_modules excluded by policy" in file-inventory.json. |
| `.next/` | Next.js build cache (regenerable). Gitignored. | No. |
| `build caches`, `OS-specific caches`, `editor caches` | Machine state. Gitignored. | No. |
| `.DS_Store` | macOS filesystem metadata. Gitignored. | No. |
| `IDE-private state` | Editor state. Gitignored. | No. |
| `tool-results/` | Transient tool output from the agent session. Not relevant to corpus. | No. |
| `upload/`, `download/` | Sandbox transfer staging. Not project artifacts. | No. |
| `skills/` | Sandbox skill definitions (not Writing OS artifacts). Gitignored. | No. |

## Excluded as out-of-scope (NOT Writing OS v1 artifacts)

| Class | Reason | Sanitized representation? |
|---|---|---|
| `research/` web-scraped legal/academic source JSON | Pre-existing tracked source data for nonfiction research (not Phase 2B). Left unchanged. | N/A — unchanged, already tracked. |
| `experiments/` | Pre-existing iteration-4 experiment harness (not Phase 2B.5 deliverable). Left unchanged. | N/A. |
| `logs43fw/` | Pre-existing Fireworks iteration-4.3 logs (already tracked, source of corpus cases). Left unchanged. | N/A. |

## Sanitized copies

No files required sanitization. The security scan (`forensic/phase2b-5/intermediate/security-scan-precise.txt`)
confirmed that no Writing OS artifact contains actual secret values. The two
apparent matches during the broad scan were:

1. `sk-cdf4265165...` in `research/legal_opc*.json` — false positive; this is the
   substring "sk-" inside the filename `govuk-icon-mask-cdf4265165...svg` (a UK
   government asset filename hash), not an OpenAI API key.
2. `AKIA...` in `skills/design/.../*.html` — false positive; base64-encoded image
   data coincidentally containing the 4-character sequence "AKIA". These files are
   in the gitignored `skills/` directory and are not part of Writing OS.

## Summary

- **Files preserved in forensic snapshot:** 924 (see `file-inventory.json`)
- **Files sanitized:** 0
- **Actual secrets found:** 0
- **Excluded by policy:** node_modules, .git, .next, .zscripts, .z-ai-config, tool-results, upload, download, skills, .env (all gitignored)
