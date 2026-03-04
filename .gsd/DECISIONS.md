# Architectural Decision Records (ADR)

## ADR-001: Switch from Electron to Tauri 2.0

**Date:** 2026-03-04
**Status:** Accepted
**Context:** The existing Quantumhook Desktop was built on Electron, which ships a full Chromium instance (~150–200MB bundle, ~200–400MB RAM idle, 2–5s startup). For a solo developer shipping a local-first AI assistant, this overhead is unacceptable.
**Decision:** Migrate to Tauri 2.0, which uses the OS-native webview (~5–15MB bundle, ~30–80MB RAM, <1s startup). Tauri's sidecar support lets us spawn the OpenClaw Gateway as a managed child process with lifecycle control built into Rust.
**Consequences:**
- Frontend must be rewritten in React (replacing current Lit web components).
- Rust knowledge required for backend shell (sidecar manager, config I/O, health monitor).
- Gain: future iOS/Android support from same codebase (Tauri 2.0).
- Gain: strict IPC security boundary by default.

## ADR-002: Gateway-as-Sidecar (No Fork)

**Date:** 2026-03-04
**Status:** Accepted
**Context:** Temptation exists to fork OpenClaw and modify the Gateway directly for better desktop integration.
**Decision:** Treat OpenClaw Gateway as an unmodified upstream dependency. Spawn it as a sidecar, communicate via its existing WebSocket protocol. Use a Zod config schema as an abstraction layer against config changes.
**Consequences:**
- Can update to new OpenClaw versions without rewriting the app.
- Config schema must be maintained as a mapping layer.
- Cannot add features that require Gateway-side changes (must work within existing protocol).
