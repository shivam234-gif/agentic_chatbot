---
phase: 1
plan: 4
wave: 4
depends_on: ["3-PLAN.md"]
files_modified: [
  "src/features/config/components/TestConnectionBtn.tsx",
  "src/stores/configStore.ts"
]
autonomous: true
must_haves:
  truths:
    - "Users can verify their LLM API keys work before navigating away."
    - "A backup exists allowing rollbacks from disastrous JSON changes."
---

# Plan 1.4: Connection Testing & Backups

<objective>
To implement validation connectivity tests against LLM providers over the websocket, and create a config backup safeguard.

Purpose: To ensure configurations aren't just syntactically valid (Zod), but contextually valid (API keys hit the provider successfully).
</objective>

<context>
Load for context:
- src/stores/gatewayStore.ts
</context>

<tasks>

<task type="auto">
  <name>Implement Test Connection Logic</name>
  <files>src/features/config/components/TestConnectionBtn.tsx</files>
  <action>
    Create a generic button component that emits a specific WS event to the Gateway payload testing the provider API key validity. Wrap this in UI loading state/toasts.
    AVOID: Hardcoding API calls inside React. The test MUST fire via WebSocket to the Gateway.
  </action>
  <verify>tsc --noEmit</verify>
  <done>User clicks "Test" -> WS ping -> Success/Fail toast response.</done>
</task>

<task type="auto">
  <name>Config Backup Mechanism</name>
  <files>src/stores/configStore.ts</files>
  <action>
    Before overwriting `openclaw.json` with new valid values, use Tauri `fs` to copy the existing file to `openclaw.bak.json`. Implement a quick `restoreBackup()` action for the UI.
    AVOID: Leaving zombie backups scattered around. Maintain exactly one `.bak.json`.
  </action>
  <verify>npm run lint</verify>
  <done>Backups safely written prior to mutating disk properties.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] A `.bak.json` copy spawns properly upon saving configuration.
- [ ] Invoking "Test Connection" fires a WebSocket payload observable in Network tabs.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
