# Excluded Files — Phase 2B.5R Forensic Snapshot

## Excluded by policy (NEVER committed)

| Class | Reason |
|---|---|
| `.env` / `.env.*` | Environment files may contain live API keys. Gitignored. |
| `credentials/` | Credential directory. Gitignored. |
| `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`, `*.cert` | Private key / certificate files. Gitignored. |
| API keys (FIREWORKS_API_KEY, OPENAI_API_KEY, etc.) | Live secrets. Read from env at runtime; value NEVER committed. |
| GitHub PATs (`github_pat_`, `ghp_`, `gho_`) | Git push credentials. |
| `.zscripts/` | Sandbox-private orchestration. Gitignored. |
| `.z-ai-config/` | Sandbox-private config. Gitignored. |
| `node_modules/` | Dependency tree (regenerable). Gitignored. |
| `.next/` | Next.js build cache. Gitignored. |
| `tool-results/` | Transient agent session output. |
| `upload/`, `download/` | Sandbox transfer staging. |
| `skills/` | Sandbox skill definitions (not Writing OS). Gitignored. |

## Self-referential exclusion

| File | Reason |
|---|---|
| `forensic/phase2b-5/MANIFEST.json` | Excluded from its own inventory to avoid self-referential hash problem. |
| `forensic/phase2b-5/file-inventory.json` | Same as above. |

These files ARE preserved in the git commit but excluded from SHA256 hash verification in check #20.

## Sanitized copies

No files required sanitization. Security scan confirmed 0 actual secrets in any Writing OS artifact.

## Summary

- **Files sanitized:** 0
- **Actual secrets found:** 0
- **Excluded by policy:** node_modules, .git, .next, .zscripts, .z-ai-config, tool-results, upload, download, skills, .env
