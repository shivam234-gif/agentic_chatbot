---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified: [
  "src-tauri/Cargo.toml",
  "src-tauri/capabilities/default.json",
  "src/features/config/schema/config.schema.ts",
  "src/stores/configStore.ts"
]
autonomous: true
must_haves:
  truths:
    - "A unified Zod schema covers all required settings."
    - "The React frontend can natively read and write to the OS filesystem via Tauri."
  artifacts:
    - "src/stores/configStore.ts"
---

# Plan 1.1: Config Schema & Tauri FS Adapter

<objective>
To establish the full data contract (Zod) and the bridge to the local filesystem (Tauri FS plugin) for configuration persistence.

Purpose: Without a reliable read/write loop to disk, the config UI cannot be built.
Output: A Zustand store that loads and safely writes config utilizing Tauri.
</objective>

<context>
Load for context:
- .gsd/ROADMAP.md
- src/features/config/schema/config.schema.ts
- src-tauri/Cargo.toml
</context>

<tasks>

<task type="auto">
  <name>Extend Zod Config Schema</name>
  <files>src/features/config/schema/config.schema.ts</files>
  <action>
    Expand the existing schema to explicitly include UI modes, debug tools, and default values for new sections required by the OpenClaw spec.
    AVOID: Rebuilding the foundational LLM provider schemas already set up in Phase 0.
  </action>
  <verify>npm run tsc --noEmit</verify>
  <done>Zod defines a complete typing system for openclaw.json.</done>
</task>

<task type="auto">
  <name>Implement Tauri FS Config Store</name>
  <files>
    src-tauri/Cargo.toml
    src-tauri/capabilities/default.json
    src/stores/configStore.ts
  </files>
  <action>
    Install the Tauri `fs` and `os` plugins in Cargo.toml. Grant `fs:read` and `fs:write` permissions to the AppData directory in Tauri capabilities. Create a Zustand `configStore.ts` that provides `loadConfig()`, `saveConfig()`, and `resetConfig()` methods acting on `openclaw.json`.
    AVOID: Using Node's native `fs` module in React. We MUST use `@tauri-apps/plugin-fs`.
  </action>
  <verify>cargo check</verify>
  <done>Zustand securely orchestrates file CRUD via Tauri IPC.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Zod schema successfully compiles against the latest requirements.
- [ ] Tauri capabilities permit file read/write to the standard AppData config location.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
