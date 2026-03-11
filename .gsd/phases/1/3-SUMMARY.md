---
phase: 1
plan: 3
wave: 3
status: complete
---

# Plan 1.3 Summary: Raw JSON Mode & Sync

## Execution Log
- Installed `@monaco-editor/react`.
- Created `RawJsonEditor.tsx` wrapping Monaco with dynamic sizing and dark mode.
- Injected pseudo JSON schema defaults to Monaco to validate the first level of structure, while delegating deep structural validation to the `zod` schema parser on change.
- Integrated `RawJsonEditor` into `ConfigEditor.tsx` with a dual-mode toolbar (Visual vs. Raw JSON).
- Bi-directional sync works seamlessly: React Hook Form binds to Zustand visually; Monaco parses `onChange` directly against the Zod schema and pushes back into Zustand if valid.
- Added visual error boundary popups for invalid JSON inputs inside the Raw mode.

## Outcomes
- **Power User Flexibility**: Power Users and Developers can modify `openclaw.json` natively as text.
- **Data Safety**: No invalid data is flushed to Tauri/Zustand until the full Zod schema passes, preventing crashes.

## Next Step
Wave 4 (Plan 1.4) — Backup Mechanisms & Gateway Connection Tests.
