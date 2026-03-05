# Architecture

> Updated by /map on 2026-03-04, aligned with [openclaw-architecture.md](file:///home/shivek/Documents/agentic_chatbot/openclaw-architecture.md)

## Overview

### Current State — Electron (What exists today)

Quantumhook Desktop is **currently an Electron-based** desktop application. The Electron main process (`electron/main.ts`) spawns the OpenClaw Gateway as a Node.js child process on port 3000, then loads the React/Lit UI via Vite dev server (port 5173). The frontend (`src/ui/app.ts`) is a Lit web component (`<openclaw-app>`) that communicates with the Gateway over WebSocket.

### Target State — Tauri 2.0 (Migration goal)

The migration target is **Tauri 2.0**: replacing Electron with a Rust shell that uses the OS-native webview (~5–15 MB bundle vs Electron's ~150–200 MB). The Rust shell will manage the Gateway as a proper sidecar with lifecycle control, health checks, and auto-restart. The Lit frontend will be rewritten in React + shadcn/ui. See `ROADMAP.md` Phase 0 for the migration plan.

```
┌─────────────────────────────────────────────────────────┐
│                    TAURI SHELL (Rust)                     │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Sidecar     │  │  Health       │  │  System        │  │
│  │  Manager     │  │  Monitor      │  │  Tray + Menu   │  │
│  │  (Gateway)   │  │  (Watchdog)   │  │  (Native)      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────────┘  │
│         │                  │                               │
│         │    ┌─────────────┴─────────────┐                │
│         │    │     IPC Bridge (Tauri)     │                │
│         │    │   Commands + Events        │                │
│         │    └─────────────┬─────────────┘                │
│         │                  │                               │
│  ┌──────┴──────────────────┴──────────────────────────┐  │
│  │              WEBVIEW (React Frontend)               │  │
│  │  Onboard Wizard │ Config Studio │ Channels │ Chat   │  │
│  │  Session Mgr    │ Skills Market │ Voice    │ Debug  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │ ws://127.0.0.1:18789
         ▼
┌─────────────────────────────────────────────────────────┐
│              OPENCLAW GATEWAY (Node.js Sidecar)          │
│  Pi Agent │ Channel Bridge │ Session Store │ Tools       │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

1. **Separation of concerns:** Tauri Rust = process management + OS integration. React = all UI. Gateway = untouched upstream.
2. **Gateway-as-sidecar:** Never modify OpenClaw core. Spawn it, monitor it, restart it. Stay upstream-compatible.
3. **Config abstraction:** A Zod schema is the single source of truth driving Wizard, Visual Editor, and Raw JSON modes. The user never touches `openclaw.json` directly.
4. **Tiered UX:** Consumer (default) → Power User → Developer. Each tier reveals more complexity.

## Components

### Tauri Rust Backend (`src-tauri/`)
- **Sidecar Manager:** Spawns Gateway, captures stdout/stderr, handles crashes with exponential backoff restart (max 3 in 60s).
- **Health Monitor:** HTTP GET `/health` every 5s. Emits connection state events to frontend.
- **Config I/O:** Reads/writes `~/.openclaw/openclaw.json` with auto-backup (last 10 versions).
- **System Tray:** Native tray icon showing green/yellow/red status.

### React Frontend (`src/`)
- **Onboarding Wizard:** Welcome → AI Model Setup → Channel Selection → Channel Auth → Test → Done.
- **Config Studio:** 3 modes (Wizard / Visual Editor / Raw JSON) with bidirectional sync.
- **Channel Manager:** Card grid with per-channel status, reconnect/pause/remove actions.
- **Unified Inbox:** Conversation list + message view across all channels.
- **Status Bar:** Always-visible: Gateway status, channel count, active model, network activity.

### OpenClaw Gateway (Node.js Sidecar)
- Unchanged upstream dependency.
- Communicates via existing WebSocket protocol on `ws://127.0.0.1:18789`.
- Hosts Pi Agent runtime, channel bridges, session store, and tool integrations.

## Data Flow

1. User interacts with React UI in Tauri webview.
2. UI sends Tauri IPC commands to Rust backend for config/file/process operations.
3. UI connects directly to Gateway via WebSocket for chat, channels, and real-time events.
4. Rust backend monitors Gateway health and emits status events to UI.
5. Config changes flow: UI → Zod validation → Tauri fs write → Gateway restart if needed.

## Integration Points

| Service | Type | Purpose |
|---------|------|---------|
| OpenClaw Gateway | WebSocket Sidecar | AI agent runtime, channels, sessions |
| OpenAI / Anthropic / Google | API (via Gateway) | LLM inference |
| WhatsApp (Baileys) | Channel (via Gateway) | Messaging bridge |
| Telegram / Discord / Slack | Channel (via Gateway) | Messaging bridges |
| OS Notifications | Tauri Plugin | Native desktop notifications |
| Auto-Updater | Tauri Plugin | App + Gateway updates |

## Technical Debt (from previous Electron version)
- [ ] Migrate from Electron to Tauri 2.0 (removes ~150MB bundle overhead).
- [ ] Replace Lit web components with React + shadcn/ui.
- [ ] Eliminate raw JSON config editing for consumer users.
- [ ] Add Gateway crash recovery (currently crashes are fatal).
- [ ] Secure API key storage (currently in plain JSON).

## Conventions
**Naming:** React components in PascalCase. Rust modules in snake_case. Zustand stores as `*Store.ts`.
**Structure:** Feature-based folder structure under `src/features/`. Shared UI in `src/components/ui/`.
**Testing:** Vitest (unit) + Playwright (E2E).
