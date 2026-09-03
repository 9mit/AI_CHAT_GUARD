# DeckMind AI Privacy Policy & Security Guarantee

Last updated: August 2026

## 1. Zero-Trust Local Architecture
DeckMind AI is designed from the ground up on a local-first, zero-trust privacy paradigm:
- **100% Client-Side Ingestion**: All conversational parsing, concept extraction, and slide layout structuring occur entirely within your browser's execution memory.
- **Zero Third-Party Commercial Cloud Calls**: No raw chat logs, user queries, assistant responses, or generated presentation slides are transmitted to external commercial model vendors or proprietary data processors.

## 2. In-Memory Credential & Secret Sanitization
Before any slide compilation or semantic analysis occurs, DeckMind AI runs a client-side redaction filter targeting sensitive patterns:
- AWS Access & Secret Keys (`AKIA...`, `ASIA...`)
- OpenAI & Anthropic API Tokens (`sk-proj-...`, `sk-ant-...`, `sk-...`)
- GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`)
- Google API Keys (`AIza...`)
- JSON Web Tokens (`eyJ...`)
- Asymmetric Private Keys (`-----BEGIN PRIVATE KEY-----`)

All matching tokens are masked with deterministic redaction tags (e.g. `[REDACTED_OPENAI_KEY]`) in memory.

## 3. Open-Source Self-Hosted Model Integration
When connecting to local open-source inference servers (e.g. Ollama, LM Studio, or Stable Diffusion WebUI):
- Communication is restricted to localhost network requests (e.g. `http://localhost:11434`, `http://localhost:7860`).
- No external internet traffic is generated for inference.

## 4. Chrome Web Store Sandbox Compliance
DeckMind AI strictly follows Google Chrome Manifest V3 extension guidelines:
- Minimal required permissions (`activeTab`, `storage`, `unlimitedStorage`, `contextMenus`).
- Sandboxed execution without remote script loading (`script-src 'self'`).

## 5. Contact & Auditing
DeckMind AI source code is open and verifiable. For questions, security audits, or contributions, please inspect the repository directly.
