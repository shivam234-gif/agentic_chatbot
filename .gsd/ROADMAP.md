# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 — Quantumhook Desktop
> **Source**: [openclaw-architecture.md](file:///home/shivek/Documents/agentic_chatbot/openclaw-architecture.md)

## Must-Haves (from SPEC)
- [ ] Tauri 2.0 shell that spawns OpenClaw Gateway as a managed sidecar.
- [ ] Config Studio with 3 modes (Wizard / Visual Editor / Raw JSON) driven by Zod schema.
- [ ] Guided onboarding wizard (model setup + first channel in <5 minutes).
- [ ] Unified inbox showing conversations across all connected channels.
- [ ] Tiered UX: Consumer → Power User → Developer modes.
- [ ] Installable desktop packages (.dmg, .msi, .AppImage).

---

## Phases

### Phase 0: Foundation (Weeks 1–3)
**Status**: ✅ Complete
**Objective**: Bootable Tauri app that spawns OpenClaw Gateway and connects.
- [ ] Scaffold Tauri 2.0 project with React + Vite + TypeScript
- [ ] Implement Gateway sidecar manager in Rust (spawn, health check, restart)
- [ ] Build WebSocket connection manager with reconnect logic
- [ ] Create basic IPC bridge: frontend can send commands to Gateway via Rust
- [ ] Implement system tray icon with status (green/yellow/red)
- [ ] Add basic status bar showing Gateway connection state
- [ ] Write the Zod config schema for top-level `openclaw.json` keys

**Milestone**: App launches, Gateway starts automatically, green status indicator.

---

### Phase 1: Config Studio [Complete]
- Objective: Users can fully configure OpenClaw without touching JSON.
- Status: Complete
- Outputs:
  - `ConfigStore` tied to Tauri `fs/os` APIs.
- [ ] Build Config Schema layer (Zod schemas for ALL config keys)
- [ ] Implement Visual Config Editor (category sidebar + form fields)
- [ ] Add config read/write via Tauri fs plugin
- [ ] Implement config validation with inline error messages
- [ ] Build config backup/restore system
- [ ] Add "Test Connection" for model providers (API key validation)
- [ ] Build Raw JSON mode with Monaco editor + schema validation
- [ ] Implement bidirectional sync between Visual ↔ Raw modes

**Milestone**: User can configure model, basic settings, and API keys visually.

---

### Phase 2: Channel Onboarding (Weeks 8–12)
**Status**: ⬜ Not Started
**Objective**: Guided setup for each channel, one at a time.
- [ ] Build channel card grid UI
- [ ] Implement WhatsApp setup flow (QR code via Baileys)
- [ ] Implement Telegram setup flow (BotFather token input)
- [ ] Implement Discord setup flow (bot token + guild selection)
- [ ] Implement Slack setup flow (bot token + app token)
- [ ] Build generic "channel health" status cards
- [ ] Add per-channel reconnect/pause/remove actions
- [ ] Build the first-run onboarding wizard (combines model + 1 channel)

**Milestone**: User can onboard and manage all channels through the GUI. **Shippable MVP.**

---

### Phase 3: Inbox & Conversations (Weeks 13–17)
**Status**: ⬜ Not Started
**Objective**: Unified inbox showing all conversations across channels.
- [ ] Build conversation list sidebar (grouped by channel)
- [ ] Implement conversation view (message bubbles, timestamps)
- [ ] Add real-time message streaming via Gateway WebSocket
- [ ] Build session management UI (new/reset/compact)
- [ ] Add typing indicators and presence
- [ ] Implement media rendering (images, audio, video)
- [ ] Build search across conversations
- [ ] Add notification system (native OS notifications via Tauri)

**Milestone**: Full chat experience across all connected channels.

---

### Phase 4: Voice, Canvas & Tools (Weeks 18–22)
**Status**: ⬜ Not Started
**Objective**: Advanced features for power users.
- [ ] Integrate Voice Wake / Talk Mode controls
- [ ] Build Canvas viewer (render A2UI content from Gateway)
- [ ] Add browser control panel (status, screenshots, action history)
- [ ] Build Skills marketplace UI (browse, install, configure)
- [ ] Implement cron/webhook management UI
- [ ] Add usage tracking dashboard (tokens, cost per model)

**Milestone**: Feature parity with OpenClaw CLI for core workflows.

---

### Phase 5: Polish & Ship (Weeks 23–26)
**Status**: ⬜ Not Started
**Objective**: Production-ready v1.0.
- [ ] Implement tiered mode system (Consumer → Power User → Developer)
- [ ] Build Gateway log viewer (streaming, filterable)
- [ ] Add auto-updater (Tauri updater for app + npm update for Gateway)
- [ ] Performance audit (startup time, memory usage, WS latency)
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Build installers: macOS (.dmg), Windows (.msi), Linux (.AppImage)
- [ ] Write user documentation
- [ ] Beta testing with 5–10 real users
- [ ] Fix top issues from beta → ship v1.0

**Milestone**: Installable app that non-technical users can set up in under 5 minutes.
