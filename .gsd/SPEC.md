# SPEC.md — Project Specification

> **Status**: `FINALIZED`
> **Aligned with**: [openclaw-architecture.md](file:///home/shivek/Documents/agentic_chatbot/openclaw-architecture.md)

## Vision
Build a **Tauri 2.0-based desktop app** (Quantumhook Desktop) that wraps the OpenClaw Gateway with a wizard-driven, visually intuitive frontend. OpenClaw's engine is powerful but its UX is hostile — we fix the UX layer, add a stability/resilience shell, and ship a tiered experience that works for everyone from non-technical consumers to power developers. The user never touches raw JSON, never manages node servers, and never sees a crash.

## Goals
1. **Frictionless Onboarding:** Wizard-driven setup that takes a non-technical user from download to first AI response in under 5 minutes.
2. **Config Studio:** A 3-mode configuration UI (Wizard / Visual Editor / Raw JSON) driven by a single Zod schema source of truth, so users never need to hand-edit `openclaw.json`.
3. **Gateway Resilience:** The Tauri Rust shell manages the OpenClaw Gateway as a sidecar with health checks, auto-restart, and crash recovery — the user sees "Reconnecting…" for 2 seconds, not a broken app.
4. **Curated LLM Selection:** Provide top-tier LLM providers (OpenAI, Anthropic, Google Gemini) with dropdown model selection and one-field API key entry.
5. **Tiered UX:** Consumer Mode (default, zero complexity) → Power User Mode (visual config, sessions, skills) → Developer Mode (raw JSON, logs, WS inspector).
6. **Unified Inbox:** All channel conversations (WhatsApp, Telegram, Discord, Slack) in a single, searchable interface.

## Non-Goals (Out of Scope for v1.0)
- Building a custom agent runtime (use OpenClaw's Pi agent as-is).
- Forking OpenClaw core (stay upstream-compatible).
- Cloud/hosted version (local-first only).
- Mobile apps (Tauri 2.0 supports it, but desktop first).
- Custom channel implementations (use OpenClaw's).
- Supporting every obscure LLM provider (top 3-4 only).

## Users
- **Consumer:** Non-technical users who want an AI assistant on their desktop without CLI or config file knowledge.
- **Power User:** Tech-savvy users who want visual control over channels, sessions, skills, and model selection.
- **Developer:** Engineers who want raw JSON editing, gateway logs, WebSocket inspection, and agent prompt editing.

## Constraints
- **Solo developer:** Phased delivery is critical — ship after Phase 2, iterate from feedback.
- **Upstream dependency:** OpenClaw Gateway is treated as an unmodified managed dependency. Config schema acts as an abstraction layer against breaking changes.
- **Security:** API keys stored securely via Tauri fs plugin, not exposed in logs or network. Strict IPC boundary enforced by Tauri by default.

## Success Criteria
- [ ] **5-minute onboarding:** Non-technical user goes from download → first AI response on WhatsApp in under 5 minutes.
- [ ] **Zero JSON editing:** Consumer-mode users never see or edit JSON.
- [ ] **99% uptime feel:** Gateway crashes are invisible — auto-restart takes <3 seconds.
- [ ] **Config confidence:** Users can change settings without fear of breaking things (validation + backups).
- [ ] **Channel reliability:** Connected channels show green status >95% of the time.
- [ ] **Installable:** Packaged as `.dmg` (macOS), `.msi` (Windows), `.AppImage` (Linux).
