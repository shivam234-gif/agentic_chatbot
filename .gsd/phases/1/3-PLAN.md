---
phase: 1
plan: 3
wave: 3
depends_on: ["2-PLAN.md"]
files_modified: [
  "src/features/config/components/RawJsonEditor.tsx",
  "src/features/config/components/ConfigEditor.tsx"
]
autonomous: true
must_haves:
  truths:
    - "Developers have a code editor view natively in the app."
    - "Switching between Visual and Raw mode retains structural integrity."
---

# Plan 1.3: Raw JSON Mode & Sync

<objective>
To implement a code-editor view for power users via Monaco Editor with bi-directional syncing.

Purpose: Power users prefer editing JSON directly for speed; the system must gracefully handle this.
</objective>

<context>
Load for context:
- src/features/config/components/ConfigEditor.tsx
</context>

<tasks>

<task type="auto">
  <name>Integrate Monaco Editor</name>
  <files>src/features/config/components/RawJsonEditor.tsx</files>
  <action>
    Install `@monaco-editor/react` and implement `RawJsonEditor.tsx`. Pass the JSON schema into Monaco for built-in intellisense.
    AVOID: Unnecessary Webpack configurations; Monaco-react handles Vite nicely natively.
  </action>
  <verify>npm run lint</verify>
  <done>Raw source code view renders effectively in the app state.</done>
</task>

<task type="auto">
  <name>Bidirectional Synchronization</name>
  <files>src/features/config/components/ConfigEditor.tsx</files>
  <action>
    Add a toggle to switch between Visual and Raw modes. Ensure edits in Raw mode are validated via Zod before applying them back to the Visual React-Hook-Form state.
    AVOID: Crashing if a user types invalid syntax. Show a parsing error overlay instead.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Forms can bounce safely between modes provided the JSON isn't fundamentally broken.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Changing a value in raw JSON updates the visual form immediately upon toggle.
- [ ] Invalid JSON disables the "Save" button and displays a compilation warning.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
