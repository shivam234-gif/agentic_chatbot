# OpenClaw GUI — Architecture & Roadmap

## Executive Summary

Build a **Tauri 2.0-based desktop app** that wraps the OpenClaw Gateway with a wizard-driven, visually intuitive frontend. The core thesis: OpenClaw's engine is powerful but its UX is hostile — we fix the UX layer, add a stability/resilience shell, and ship a tiered experience that works for everyone from non-technical consumers to power developers.

---

## 1. Platform Decision: Why Tauri 2.0 (Not Electron)

### The Recommendation

**Switch from Electron to Tauri 2.0.** Here's why this matters for a solo developer:

| Factor | Electron | Tauri 2.0 |
|--------|----------|-----------|
| Bundle size | ~150-200 MB (ships Chromium) | ~5-15 MB (uses native webview) |
| RAM usage | ~200-400 MB idle | ~30-80 MB idle |
| Startup time | 2-5 seconds | <1 second |
| Backend language | Node.js (JS) | Rust (with Node sidecar support) |
| Auto-updater | Built-in but heavy | Built-in, lightweight |
| Cross-platform | macOS/Win/Linux | macOS/Win/Linux + iOS/Android (v2) |
| Security | Full Node access in renderer (risky) | Strict IPC boundary by default |

**The critical advantage for your use case:** Tauri 2.0 supports **sidecars** — you can spawn the OpenClaw Gateway (Node.js process) as a managed sidecar, with lifecycle control (start, stop, restart, health checks) built into the Rust backend. This directly solves your Gateway crash/instability problem because the Tauri shell can detect crashes and auto-restart.

**The mobile story:** Tauri 2.0 supports iOS and Android targets, which aligns with OpenClaw's node architecture. You could eventually ship companion mobile apps from the same codebase.

### Frontend Framework

Use **React + TypeScript + Tailwind CSS** for the webview frontend. Reasoning:
- Largest ecosystem of UI component libraries (shadcn/ui, Radix)
- You likely already know React from your Electron app
- Best tooling for complex form/config UIs (React Hook Form, Zod validation)
- Vite as bundler for fast dev iteration

---

## 2. High-Level Architecture

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
│  │                                                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Onboard  │ │ Config   │ │ Channels │ │ Chat/  │ │  │
│  │  │ Wizard   │ │ Studio   │ │ Manager  │ │ Inbox  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Session  │ │ Skills   │ │ Voice    │ │ Logs/  │ │  │
│  │  │ Manager  │ │ Market   │ │ Panel    │ │ Debug  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
         │ ws://127.0.0.1:18789
         ▼
┌─────────────────────────────────────────────────────────┐
│              OPENCLAW GATEWAY (Node.js Sidecar)          │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Pi Agent │ │ Channel  │ │ Session  │ │ Tools      │  │
│  │ Runtime  │ │ Bridge   │ │ Store    │ │ (Browser,  │  │
│  │          │ │ (WA/TG/  │ │          │ │  Canvas,   │  │
│  │          │ │  Slack…) │ │          │ │  Cron…)    │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

**a) Separation of concerns:** The Tauri Rust layer handles process management, file system, OS integration, and health monitoring. The React layer handles ALL user-facing UI. The OpenClaw Gateway remains untouched — you communicate with it via its existing WebSocket protocol.

**b) Gateway-as-sidecar:** You never modify OpenClaw core. You treat it as a managed dependency. This means you can update to new OpenClaw versions without rewriting your app. The Rust sidecar manager spawns `openclaw gateway`, monitors its stdout/stderr, detects crashes, and auto-restarts.

**c) Config abstraction layer:** The biggest architectural innovation — you build a **Config Studio** that reads/writes `~/.openclaw/openclaw.json` through a visual UI, but with validation, templates, and guided flows. The user never sees raw JSON.

---

## 3. The Configuration Problem (Your Biggest Pain Point)

### Current State (Painful)

Users must hand-edit `~/.openclaw/openclaw.json` — a deeply nested JSON5 file with 100+ possible keys, no validation feedback, and cryptic naming. One typo and the Gateway won't start.

### Proposed Solution: Config Studio

The Config Studio is a **visual configuration builder** with three modes:

**Mode 1: Wizard (Non-technical users)**
- Step-by-step guided flow
- Plain English questions: "Which messaging apps do you want to connect?"
- User selects WhatsApp → shown QR code scanner
- User selects Telegram → shown "Paste your bot token here" with a link to BotFather
- Each step validates before proceeding
- Generates the full `openclaw.json` automatically

**Mode 2: Visual Editor (Tech-savvy users)**
- Category-based sidebar: General, Model, Channels, Security, Tools, Advanced
- Each setting is a form field with label, description, type validation
- Toggle switches for booleans, dropdowns for enums, text inputs with regex validation
- "Test Connection" buttons for each channel
- Live preview of the generated JSON
- Inline documentation (tooltip on every field explaining what it does)

**Mode 3: Raw JSON (Developers)**
- Monaco editor (VS Code-like) with JSON5 syntax highlighting
- JSON Schema-based autocomplete and inline validation
- Diff view showing changes from defaults
- One-click switch between Visual Editor ↔ Raw JSON (bidirectional sync)

### Config Schema Architecture

```
┌────────────────────────────────────────────┐
│             Config Schema Layer             │
│                                             │
│  openclaw.schema.ts                         │
│  ├─ Zod schema (runtime validation)         │
│  ├─ Default values per field                │
│  ├─ Human-readable labels + descriptions    │
│  ├─ Field-level constraints (min/max/regex) │
│  ├─ Dependency rules (field A shows if B=X) │
│  └─ Category groupings for UI rendering     │
│                                             │
│  This single schema drives:                 │
│  → Wizard step generation                   │
│  → Visual editor form rendering             │
│  → Raw JSON validation                      │
│  → Config migration between versions        │
└────────────────────────────────────────────┘
```

The schema is the **single source of truth**. When OpenClaw adds new config keys, you update the schema once and all three modes automatically support it.

---

## 4. Stability & Resilience Layer

This is what transforms a "wrapper" into a "product."

### 4a. Gateway Health Monitor (Rust)

```
Tauri Rust Backend
│
├─ GatewayManager
│  ├─ spawn_gateway() → Child process with stdout/stderr capture
│  ├─ health_check() → HTTP GET /health every 5s
│  ├─ restart_policy:
│  │  ├─ max_restarts: 3 within 60s
│  │  ├─ backoff: exponential (1s, 2s, 4s)
│  │  └─ on_max_restarts: notify user, offer diagnostics
│  ├─ graceful_shutdown() → SIGTERM → wait 5s → SIGKILL
│  └─ log_capture() → Ring buffer of last 500 lines
│
├─ WebSocketReconnect
│  ├─ auto_reconnect: true
│  ├─ reconnect_interval: exponential backoff
│  ├─ connection_state → emitted to frontend as events
│  └─ message_queue → buffer messages during reconnect
│
└─ ConfigWatcher
   ├─ fs::watch on ~/.openclaw/openclaw.json
   ├─ on_change → validate → hot-reload if safe, else prompt restart
   └─ backup_before_write() → ~/.openclaw/config-backups/
```

### 4b. WebSocket Connection Manager (Frontend)

```typescript
// Conceptual state machine for WS connection
States:
  DISCONNECTED → CONNECTING → CONNECTED → RECONNECTING
                                        → DISCONNECTED (fatal)

Events emitted to UI:
  connection:status  → green/yellow/red indicator in status bar
  connection:latency → ping/pong measurement
  gateway:health     → full health report
  gateway:restarting → show "Restarting..." overlay
```

### 4c. Config Backup & Recovery

- Auto-backup before every config write (keep last 10 versions)
- "Config History" panel: see what changed, when, one-click rollback
- "Factory Reset" option: restore to a known-good default config
- Config export/import: share your setup or move between machines

---

## 5. Tiered User Experience Design

### Tier 1: Consumer Mode (Default)

What the user sees on first launch:
1. Welcome screen with friendly illustration
2. "Let's set up your assistant" → Name it, pick a personality
3. "Which apps should your assistant live in?" → Icon grid of channels
4. Click WhatsApp → QR code appears → scan → done
5. "Pick your AI brain" → Simple cards: "Fast" (Haiku), "Smart" (Sonnet), "Genius" (Opus) with a "Bring your own key" option
6. "You're all set!" → lands in a clean inbox view

What's hidden: JSON config, sessions, tool configuration, agent routing, security policies. All set to safe defaults.

### Tier 2: Power User Mode

Unlocked via Settings → "Advanced Mode" toggle:
- Visual Config Editor appears in sidebar
- Session management panel
- Skills marketplace
- Channel-level settings (group policies, allowlists)
- Usage/cost tracking dashboard

### Tier 3: Developer Mode

Unlocked via Settings → "Developer Mode" toggle:
- Raw JSON editor
- Gateway log viewer (real-time streaming)
- WebSocket inspector (message-level debugging)
- Terminal/CLI access to `openclaw` commands
- Agent prompt editor (AGENTS.md, SOUL.md, TOOLS.md)
- Multi-agent routing configuration

---

## 6. Module-by-Module Architecture

### 6a. Onboarding Wizard

```
Flow: Welcome → AI Model Setup → Channel Selection → Channel Auth → Test → Done

Key UX decisions:
- ONE channel at a time during onboarding (don't overwhelm)
- "Add more channels later" is always visible
- Each channel has a mini-tutorial with screenshots
- "Test message" step: send yourself a test message to confirm it works
- Skip button on every step (nothing is mandatory)
- Progress bar showing completion percentage
```

### 6b. Unified Inbox

```
┌──────────────────────────────────────────────────┐
│  [Search]                    [Filter ▾] [+ New]  │
├────────────┬─────────────────────────────────────┤
│ Channels   │  Conversation View                   │
│            │                                      │
│ 🟢 WhatsApp│  John (WhatsApp)                     │
│   John  2m │  ─────────────────────               │
│   Sarah 1h │  John: Hey, can you help me with...  │
│            │  🤖 Bot: Sure! I can help you with... │
│ 🟢 Telegram│                                      │
│   Dev  10m │                                      │
│            │  ┌──────────────────────────────┐    │
│ 🟡 Discord │  │ Type a message or command... │    │
│   #gen  5m │  └──────────────────────────────┘    │
│            │                                      │
│ ⚙️ Settings│  [Status: 🟢 Connected] [Model: ◆]  │
└────────────┴─────────────────────────────────────┘
```

### 6c. Channel Manager

```
Each channel gets a "card" with:
├─ Connection status (🟢 connected / 🟡 reconnecting / 🔴 disconnected)
├─ Quick actions (Reconnect, Pause, Remove)
├─ Stats (messages today, uptime)
├─ Health indicator (last error, if any)
└─ Settings (expandable: allowlists, group rules, DM policy)

"Add Channel" flow:
├─ Grid of channel icons
├─ Click one → guided setup (different per channel)
├─ Each channel type has:
│  ├─ Prerequisites check (e.g., "Do you have a Telegram bot token?")
│  ├─ Step-by-step auth flow
│  ├─ Connection test
│  └─ Default safety settings (DM pairing enabled by default)
```

### 6d. Status Bar (Always Visible)

```
┌──────────────────────────────────────────────────────┐
│ 🟢 Gateway Online │ 3 Channels │ Model: Sonnet │ ↑↓ │
└──────────────────────────────────────────────────────┘

- Gateway status: click to see health details + restart button
- Channels: click to see per-channel status
- Model: click to quick-switch models
- ↑↓: network activity indicator
```

---

## 7. Tech Stack (Final)

```
Desktop Shell:     Tauri 2.0 (Rust)
Frontend:          React 19 + TypeScript + Vite
Styling:           Tailwind CSS + shadcn/ui components
State Management:  Zustand (lightweight, works well with Tauri IPC)
Forms/Validation:  React Hook Form + Zod
Config Schema:     Zod (shared between frontend validation + Rust validation)
Rich Text/Code:    Monaco Editor (for raw JSON mode)
WebSocket Client:  Native WebSocket + custom reconnect manager
Notifications:     Tauri native notifications
Auto-Update:       Tauri updater plugin
System Tray:       Tauri system tray plugin
Storage:           Tauri fs plugin (read/write ~/.openclaw/)
Logging:           Tauri log plugin → file + UI viewer
Testing:           Vitest (unit) + Playwright (E2E)
Backend Sidecar:   OpenClaw Gateway (Node.js, spawned as child process)
```

---

## 8. Phased Roadmap (Solo Developer — Realistic Timeline)

### Phase 0: Foundation (Weeks 1-3)

**Goal: Bootable Tauri app that spawns OpenClaw Gateway and connects.**

- [ ] Scaffold Tauri 2.0 project with React + Vite + TypeScript
- [ ] Implement Gateway sidecar manager in Rust (spawn, health check, restart)
- [ ] Build WebSocket connection manager with reconnect logic
- [ ] Create basic IPC bridge: frontend can send commands to Gateway via Rust
- [ ] Implement system tray icon with status (green/yellow/red)
- [ ] Add basic status bar showing Gateway connection state
- [ ] Write the Zod config schema for top-level `openclaw.json` keys

**Milestone: App launches, Gateway starts automatically, green status indicator.**

### Phase 1: Config Studio (Weeks 4-7)

**Goal: Users can fully configure OpenClaw without touching JSON.**

- [ ] Build Config Schema layer (Zod schemas for ALL config keys)
- [ ] Implement Visual Config Editor (category sidebar + form fields)
- [ ] Add config read/write via Tauri fs plugin
- [ ] Implement config validation with inline error messages
- [ ] Build config backup/restore system
- [ ] Add "Test Connection" for model providers (API key validation)
- [ ] Build Raw JSON mode with Monaco editor + schema validation
- [ ] Implement bidirectional sync between Visual ↔ Raw modes

**Milestone: User can configure model, basic settings, and API keys visually.**

### Phase 2: Channel Onboarding (Weeks 8-12)

**Goal: Guided setup for each channel, one at a time.**

- [ ] Build channel card grid UI
- [ ] Implement WhatsApp setup flow (QR code via Baileys)
- [ ] Implement Telegram setup flow (BotFather token input)
- [ ] Implement Discord setup flow (bot token + guild selection)
- [ ] Implement Slack setup flow (bot token + app token)
- [ ] Build generic "channel health" status cards
- [ ] Add per-channel reconnect/pause/remove actions
- [ ] Build the first-run onboarding wizard (combines model + 1 channel)
- [ ] Implement remaining channels (Signal, iMessage, Teams, IRC, Matrix, etc.)

**Milestone: User can onboard and manage all channels through the GUI.**

### Phase 3: Inbox & Conversations (Weeks 13-17)

**Goal: Unified inbox that shows all conversations across channels.**

- [ ] Build conversation list sidebar (grouped by channel)
- [ ] Implement conversation view (message bubbles, timestamps)
- [ ] Add real-time message streaming via Gateway WebSocket
- [ ] Build session management UI (new/reset/compact)
- [ ] Add typing indicators and presence
- [ ] Implement media rendering (images, audio, video)
- [ ] Build search across conversations
- [ ] Add notification system (native OS notifications via Tauri)

**Milestone: Full chat experience — see and interact with all conversations.**

### Phase 4: Voice, Canvas & Tools (Weeks 18-22)

**Goal: Advanced features for power users.**

- [ ] Integrate Voice Wake / Talk Mode controls
- [ ] Build Canvas viewer (render A2UI content from Gateway)
- [ ] Add browser control panel (status, screenshots, action history)
- [ ] Build Skills marketplace UI (browse, install, configure)
- [ ] Implement cron/webhook management UI
- [ ] Add usage tracking dashboard (tokens, cost per model)

**Milestone: Feature parity with OpenClaw CLI for core workflows.**

### Phase 5: Polish & Ship (Weeks 23-26)

**Goal: Production-ready v1.0.**

- [ ] Implement tiered mode system (Consumer → Power User → Developer)
- [ ] Build Gateway log viewer (streaming, filterable)
- [ ] Add auto-updater (Tauri updater for app + `npm update` for Gateway)
- [ ] Performance audit (startup time, memory usage, WS latency)
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Build installer for macOS (.dmg), Windows (.msi), Linux (.AppImage)
- [ ] Write user documentation
- [ ] Beta testing with 5-10 real users
- [ ] Fix top issues from beta → ship v1.0

**Milestone: Installable app that non-technical users can set up in under 5 minutes.**

---

## 9. Key Risk Mitigations

### Risk 1: OpenClaw Breaking Changes
**Mitigation:** Pin to a specific OpenClaw version. Test against new versions before upgrading. Your config schema layer acts as an abstraction — if OpenClaw changes config keys, you update the schema mapping without changing the UI.

### Risk 2: Solo Developer Burnout
**Mitigation:** The phased approach means you have a shippable product after Phase 2 (config + channels). Phase 3-5 are incremental improvements. Ship early, get feedback, iterate.

### Risk 3: WebSocket Reliability
**Mitigation:** The Rust-side health monitor + auto-restart + frontend reconnect manager creates a triple-layer resilience system. Even if the Gateway crashes, the user sees "Reconnecting..." for 2 seconds, not a broken app.

### Risk 4: Channel Auth Complexity
**Mitigation:** Each channel's auth flow is isolated as its own component. Start with the 4 most popular (WhatsApp, Telegram, Discord, Slack), ship those, then add others incrementally. Don't try to ship 20+ channels at once.

---

## 10. File/Folder Structure

```
openclaw-gui/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── gateway/
│   │   │   ├── mod.rs
│   │   │   ├── sidecar.rs       # Gateway process management
│   │   │   ├── health.rs        # Health check polling
│   │   │   └── websocket.rs     # WS connection manager
│   │   ├── config/
│   │   │   ├── mod.rs
│   │   │   ├── reader.rs        # Read ~/.openclaw/openclaw.json
│   │   │   ├── writer.rs        # Write with backup
│   │   │   └── validator.rs     # Rust-side validation
│   │   ├── commands/             # Tauri IPC command handlers
│   │   │   ├── gateway_cmds.rs
│   │   │   ├── config_cmds.rs
│   │   │   └── channel_cmds.rs
│   │   └── tray.rs              # System tray setup
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                          # React frontend
│   ├── app/
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   └── Layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── StatusBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── ConnectionIndicator.tsx
│   ├── features/
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.tsx
│   │   │   ├── steps/
│   │   │   │   ├── WelcomeStep.tsx
│   │   │   │   ├── ModelStep.tsx
│   │   │   │   ├── ChannelSelectStep.tsx
│   │   │   │   └── TestStep.tsx
│   │   │   └── useOnboarding.ts
│   │   ├── config/
│   │   │   ├── ConfigStudio.tsx
│   │   │   ├── VisualEditor.tsx
│   │   │   ├── RawJsonEditor.tsx
│   │   │   ├── WizardMode.tsx
│   │   │   ├── schema/
│   │   │   │   ├── config.schema.ts    # Master Zod schema
│   │   │   │   ├── model.schema.ts
│   │   │   │   ├── channels.schema.ts
│   │   │   │   └── security.schema.ts
│   │   │   └── ConfigHistory.tsx
│   │   ├── channels/
│   │   │   ├── ChannelManager.tsx
│   │   │   ├── ChannelCard.tsx
│   │   │   ├── setup/
│   │   │   │   ├── WhatsAppSetup.tsx
│   │   │   │   ├── TelegramSetup.tsx
│   │   │   │   ├── DiscordSetup.tsx
│   │   │   │   ├── SlackSetup.tsx
│   │   │   │   └── GenericSetup.tsx
│   │   │   └── useChannelHealth.ts
│   │   ├── inbox/
│   │   │   ├── Inbox.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── useMessages.ts
│   │   ├── sessions/
│   │   │   ├── SessionManager.tsx
│   │   │   └── useSessions.ts
│   │   ├── voice/
│   │   │   ├── VoicePanel.tsx
│   │   │   └── useTalkMode.ts
│   │   ├── tools/
│   │   │   ├── BrowserControl.tsx
│   │   │   ├── CanvasViewer.tsx
│   │   │   └── SkillsMarket.tsx
│   │   └── debug/
│   │       ├── LogViewer.tsx
│   │       ├── WsInspector.tsx
│   │       └── GatewayDiagnostics.tsx
│   ├── hooks/
│   │   ├── useGateway.ts         # Gateway connection state
│   │   ├── useWebSocket.ts       # WS with auto-reconnect
│   │   ├── useConfig.ts          # Read/write config via IPC
│   │   └── useTauri.ts           # Tauri command helpers
│   ├── stores/
│   │   ├── gatewayStore.ts       # Zustand: connection state
│   │   ├── configStore.ts        # Zustand: config state
│   │   ├── channelStore.ts       # Zustand: channel status
│   │   └── uiStore.ts            # Zustand: UI preferences, mode
│   ├── lib/
│   │   ├── ws-client.ts          # WebSocket protocol client
│   │   ├── config-io.ts          # Config file operations via Tauri
│   │   └── utils.ts
│   └── types/
│       ├── gateway.ts            # Gateway protocol types
│       ├── config.ts             # Config shape types
│       └── channels.ts           # Channel-specific types
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 11. Critical Implementation Details

### 11a. Gateway Sidecar (Rust)

```rust
// Pseudocode for the sidecar manager
struct GatewayManager {
    child: Option<Child>,
    restart_count: u32,
    last_restart: Instant,
    config: GatewayConfig,
}

impl GatewayManager {
    async fn start(&mut self) -> Result<()> {
        // 1. Verify Node ≥22 is installed
        // 2. Verify openclaw is installed globally
        // 3. Spawn: openclaw gateway --port 18789 --verbose
        // 4. Capture stdout/stderr to ring buffer
        // 5. Start health check polling (GET /health every 5s)
        // 6. Emit "gateway:started" event to frontend
    }

    async fn on_health_check_fail(&mut self) {
        // 1. Increment restart_count
        // 2. If restart_count > 3 in 60s → emit "gateway:fatal"
        // 3. Else → restart with exponential backoff
        // 4. Emit "gateway:restarting" to frontend
    }
}
```

### 11b. WebSocket Reconnection (Frontend)

```typescript
// State machine for WebSocket connection
class GatewayWsClient {
  private ws: WebSocket | null = null;
  private messageQueue: Message[] = [];
  private reconnectAttempt = 0;

  connect() {
    this.ws = new WebSocket('ws://127.0.0.1:18789');

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.flushQueue();        // Send buffered messages
      this.emit('connected');
    };

    this.ws.onclose = () => {
      this.emit('disconnected');
      this.scheduleReconnect(); // Exponential backoff
    };

    this.ws.onerror = () => {
      // Errors always followed by onclose — handled there
    };
  }

  send(message: Message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message); // Buffer during disconnect
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30000);
    this.reconnectAttempt++;
    setTimeout(() => this.connect(), delay);
  }
}
```

### 11c. Config Schema Pattern

```typescript
// Single schema drives all three config modes
import { z } from 'zod';

export const modelConfigSchema = z.object({
  model: z.string()
    .default('anthropic/claude-sonnet-4-5-20250929')
    .describe('The AI model to use for the assistant'),

  thinkingLevel: z.enum(['off','minimal','low','medium','high','xhigh'])
    .default('off')
    .describe('Reasoning depth — higher = slower but more accurate'),
});

// Metadata for UI rendering (separate from validation)
export const modelConfigMeta = {
  model: {
    label: 'AI Model',
    category: 'Model',
    tier: 'consumer',  // visible in consumer mode
    inputType: 'select',
    options: [
      { value: 'anthropic/claude-sonnet-4-5-20250929', label: 'Claude Sonnet (Smart)', tier: 'consumer' },
      { value: 'anthropic/claude-opus-4-6', label: 'Claude Opus (Genius)', tier: 'consumer' },
      { value: 'openai/gpt-4o', label: 'GPT-4o', tier: 'power' },
      // ...more models for power/dev tiers
    ],
    helpText: 'Choose which AI brain powers your assistant.',
  },
  thinkingLevel: {
    label: 'Thinking Depth',
    category: 'Model',
    tier: 'power',  // hidden in consumer mode
    inputType: 'slider',
    helpText: 'How much the AI "thinks" before responding.',
  },
};
```

---

## 12. What NOT to Build (Scope Control)

As a solo developer, resist these temptations until post-v1:

- **Don't build your own agent runtime.** Use OpenClaw's Pi agent as-is.
- **Don't fork OpenClaw.** Stay upstream-compatible.
- **Don't build a cloud/hosted version.** Stay local-first.
- **Don't build mobile apps yet.** Tauri 2.0 supports it, but desktop first.
- **Don't build custom channel implementations.** Use OpenClaw's.
- **Don't build a skill authoring IDE.** Skills marketplace (browse + install) is enough for v1.
- **Don't over-optimize for performance.** Ship first, optimize later.

---

## 13. Success Metrics

Your v1 is successful if:

1. **5-minute onboarding:** Non-technical user goes from download → first AI response on WhatsApp in under 5 minutes.
2. **Zero JSON editing:** Consumer-mode users never see or edit JSON.
3. **99% uptime feel:** Gateway crashes are invisible — auto-restart takes <3 seconds.
4. **Config confidence:** Users can change settings without fear of breaking things (validation + backups).
5. **Channel reliability:** Connected channels show green status >95% of the time.
