---
phase: 0
plan: 4
wave: 3
depends_on: ["3-PLAN.md"]
files_modified: [
  "src-tauri/src/tray.rs",
  "src-tauri/src/main.rs",
  "src/components/StatusBar.tsx",
  "src/App.tsx"
]
autonomous: true
must_haves:
  truths:
    - "A system tray icon appears reflecting the app."
    - "A simple status bar visualizes standard WS connection states."
---

# Plan 0.4: System Tray & Status Bar UI

<objective>
Implement OS-level integration (System Tray) and build a minimal bottom bar showing connection status.

Purpose: To complete Phase 0 by proving native OS integration alongside the React UI.
</objective>

<context>
Load for context:
- .gsd/ARCHITECTURE.md
- src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Implement Tauri System Tray</name>
  <files>
    src-tauri/src/tray.rs
    src-tauri/src/main.rs
  </files>
  <action>
    Use `tauri::SystemTray` and `SystemTrayMenu` to create a basic native tray icon. Add a simple "Quit" menu item. Wire it into the builder in `main.rs`.
    AVOID: Complex tray behaviors like dynamic icon swapping for now. Keep it to simple menu bootstrapping.
  </action>
  <verify>cargo check</verify>
  <done>Tray code compiles and links correctly to Tauri setup.</done>
</task>

<task type="auto">
  <name>Create Zustand Status Bar</name>
  <files>
    src/components/StatusBar.tsx
    src/App.tsx
  </files>
  <action>
    Create a React component (`StatusBar.tsx`) locked to the bottom of the window using Tailwind (`fixed bottom-0 w-full`). Consume `useGatewayStore` to render a Green dot if `CONNECTED`, Yellow if `CONNECTING`, Red if `DISCONNECTED`. Append the component to `App.tsx`.
    AVOID: Hardcoding complex layouts.
  </action>
  <verify>npm run lint</verify>
  <done>UI correctly consumes global state for real-time connection feedback.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] App launches with an OS tray icon visible.
- [ ] React UI correctly displays real-time `gatewayStore` variables visually.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
