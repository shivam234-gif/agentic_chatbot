# Technology Stack

> Updated on 2026-03-04, aligned with [openclaw-architecture.md](file:///home/shivek/Documents/agentic_chatbot/openclaw-architecture.md)

## Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Tauri | 2.0 | Desktop shell (Rust backend + native webview) |
| Node.js | 18+ | OpenClaw Gateway sidecar runtime |
| Rust | Latest stable | Tauri backend (sidecar mgmt, config I/O, health) |

## Frontend

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool / dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui + Radix | Accessible UI component library |
| Zustand | Lightweight state management |
| React Hook Form + Zod | Form handling + schema validation |
| Monaco Editor | Raw JSON editing mode |

## Backend (Tauri Rust)

| Crate / Plugin | Purpose |
|-----------------|---------|
| tauri | Core framework |
| tauri-plugin-fs | Read/write `~/.openclaw/` config files |
| tauri-plugin-notification | Native OS notifications |
| tauri-plugin-updater | Auto-update mechanism |
| tauri-plugin-log | File + UI log streaming |
| serde / serde_json | Config serialization |

## Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| OpenClaw Gateway | Local sidecar | AI agent runtime (Node.js) |
| Native WebView | OS-provided | Renders React frontend (~5-15MB vs Electron's ~200MB) |

## Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit tests |
| Playwright | E2E tests |

## Configuration

| Variable | Purpose | Location |
|----------|---------|----------|
| `openclaw.json` | Full Gateway config | `~/.openclaw/openclaw.json` |
| `tauri.conf.json` | Tauri app config | `src-tauri/tauri.conf.json` |
| Config backups | Auto-backup before writes | `~/.openclaw/config-backups/` |

## Comparison: Why Tauri over Electron

| Factor | Electron | Tauri 2.0 |
|--------|----------|-----------|
| Bundle size | ~150–200 MB | ~5–15 MB |
| RAM usage | ~200–400 MB idle | ~30–80 MB idle |
| Startup time | 2–5 seconds | <1 second |
| Security | Full Node in renderer | Strict IPC boundary |
| Mobile support | None | iOS + Android (v2) |
