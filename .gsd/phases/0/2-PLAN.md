---
phase: 0
plan: 2
wave: 1
depends_on: []
files_modified: [
  "src-tauri/src/main.rs",
  "src-tauri/src/gateway/mod.rs",
  "src-tauri/src/gateway/sidecar.rs",
  "src-tauri/Cargo.toml"
]
autonomous: true
must_haves:
  truths:
    - "Tauri intercepts startup and successfully boots the Node.js openclaw gateway as a sidecar."
    - "Standard output and errors from the node child process are captured."
  artifacts:
    - "src-tauri/src/gateway/sidecar.rs"
---

# Plan 0.2: Rust Sidecar Manager

<objective>
Implement the Gateway sidecar manager in Rust (spawn, health check, restart mechanism) to replace Electron's node shell capabilities.

Purpose: To cleanly manage the Gateway child process lifecycle natively without relying on heavy Node integration inside the frontend.
Output: Rust module that executes `node dist-gateway/server.mjs`.
</objective>

<context>
Load for context:
- .gsd/ARCHITECTURE.md
- src-tauri/src/main.rs
</context>

<tasks>

<task type="auto">
  <name>Build Sidecar Spawner Block</name>
  <files>
    src-tauri/Cargo.toml
    src-tauri/src/gateway/sidecar.rs
    src-tauri/src/gateway/mod.rs
  </files>
  <action>
    Add required crates (`tokio`, `sysinfo`). Write a `start_gateway` fn in `sidecar.rs`. It must spawn the packaged `node dist-gateway/server.mjs` script as a detached child process, mapping `PORT=3000`. Capture stdout/stderr using Rust's `process::Command`. 
    AVOID: Blocking the main Tauri thread. Use `tokio::spawn` to manage the process asynchronously.
  </action>
  <verify>cargo check</verify>
  <done>Rust compiles correctly; sidecar logic safely implemented.</done>
</task>

<task type="auto">
  <name>Integrate with Tauri Lifecycle</name>
  <files>
    src-tauri/src/main.rs
  </files>
  <action>
    Wire `gateway::sidecar::start_gateway()` into the Tauri `setup` hook in `main.rs`. Ensure that when Tauri receives a `RunEvent::ExitRequested`, it gracefully sends a kill signal to the Gateway child process.
    AVOID: Zombie processes holding onto port 3000 during hot-reloads.
  </action>
  <verify>cargo check</verify>
  <done>Gateway process shuts down when the desktop app is closed.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Running the Tauri app automatically makes the Gateway available on port 3000.
- [ ] Closing the Tauri app correctly kills the process running on port 3000.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
