---
phase: 0
plan: 3
wave: 2
depends_on: ["1-PLAN.md", "2-PLAN.md"]
files_modified: [
  "src/lib/ws-client.ts",
  "src/stores/gatewayStore.ts",
  "src/features/config/schema/config.schema.ts"
]
autonomous: true
must_haves:
  truths:
    - "Frontend automatically connects, disconnects, and reconnects to the local Gateway."
    - "A single source of truth using Zod outlines the OpenClaw configuration tree."
  artifacts:
    - "src/lib/ws-client.ts"
    - "src/features/config/schema/config.schema.ts"
---

# Plan 0.3: Websocket & Zod Schema

<objective>
Bridge the UI and the Gateway by implementing robust WebSocket reconnect logic and scaffold the core configuration schema.

Purpose: To ensure the UI accurately tracks gateway health and data types are locked down.
Output: Zustand store for global connection state and Zod config constraints.
</objective>

<context>
Load for context:
- .gsd/ARCHITECTURE.md
- src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Build WebSocket Reconnect Manager</name>
  <files>
    src/lib/ws-client.ts
    src/stores/gatewayStore.ts
  </files>
  <action>
    Write a native `WebSocket` wrapper class (`ws-client.ts`) that listens on `ws://127.0.0.1:3000`. Implement exponential backoff reconnect logic (1s -> 2s -> 4s). Integrate it with a Zustand store (`gatewayStore.ts`) exporting `{ status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' }`.
    AVOID: Firing infinite connecting loops if the port is entirely dead. Cap reconnect attempts or max interval to 10s.
  </action>
  <verify>npm run lint / tsc --noEmit</verify>
  <done>Zustand state accurately mirrors WS connection status.</done>
</task>

<task type="auto">
  <name>Write Baseline Zod Schema</name>
  <files>
    src/features/config/schema/config.schema.ts
  </files>
  <action>
    Define the `openclaw.json` top-level schema using `zod`. Include keys for `providers` (OpenAI, Anthropic), `models`, and `server`. 
    AVOID: Overcomplicating deep fields right now. Just scaffold the type signature for the LLM API keys since that's the prior debugging blocker.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Zod schema compiles and is ready to parse local JSON.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Starting the Gateway sidecar transitions Zustand state to `CONNECTED`.
- [ ] Stopping the Gateway transitions Zustand state to `RECONNECTING`.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
