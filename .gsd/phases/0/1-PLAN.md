---
phase: 0
plan: 1
wave: 1
depends_on: []
files_modified: [
  "package.json",
  "src-tauri/tauri.conf.json",
  "src-tauri/Cargo.toml"
]
autonomous: true
must_haves:
  truths:
    - "A fresh Tauri 2.0 project replaces the Electron wrapper"
    - "React + Vite + TypeScript are configured and building"
  artifacts:
    - "src-tauri/tauri.conf.json"
---

# Plan 0.1: Tauri Scaffold & Initial Configuration

<objective>
Replace the current Electron infrastructure with a fresh Tauri 2.0 project running React + Vite + TypeScript.

Purpose: To drastically reduce footprint and enable proper sidecar management per architecture guidelines.
Output: Bootable Tauri OS window rendering a temporary React div.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- package.json
</context>

<tasks>

<task type="auto">
  <name>Scaffold Tauri 2.0 Workspace</name>
  <files>
    package.json
    src-tauri/Cargo.toml
    src-tauri/tauri.conf.json
  </files>
  <action>
    Use cargo to initialize the Tauri workspace in `src-tauri`. Update the root `package.json` scripts to remove Electron commands (`electron:dev`, `electron:build`) and replace them with Tauri equivalents (`tauri dev`, `tauri build`). Ensure Vite is configured to compile the React frontend into the `dist` directory.
    AVOID: Modifying `apps/quantumhook-desktop/src/gateway-entry.ts`. We will deal with the gateway separately. Focus purely on Tauri app compilation.
  </action>
  <verify>npm run tauri build (dry run) or cargo check succeeds</verify>
  <done>Electron references removed, Tauri project successfully built.</done>
</task>

<task type="auto">
  <name>Setup React Root</name>
  <files>
    src/main.tsx
    src/App.tsx
    index.html
  </files>
  <action>
    Convert `src/ui/app.ts` (Lit) references into a tiny React skeleton (`App.tsx`) rendering "Gateway Status: Initializing". Update `index.html` to load `src/main.tsx`.
    AVOID: Writing complicated UI logic right now. We only need proof the React rendering pipeline inside the Tauri webview works.
  </action>
  <verify>Vite successfully compiles main.tsx</verify>
  <done>React renders cleanly inside the Tauri window when launched.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `tauri dev` launches a window displaying "Gateway Status: Initializing".
- [ ] Electron dependencies (like `electron-builder`) are removed from `package.json`.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
