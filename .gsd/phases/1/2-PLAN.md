---
phase: 1
plan: 2
wave: 2
depends_on: ["1-PLAN.md"]
files_modified: [
  "src/features/config/components/ConfigEditor.tsx",
  "src/features/config/components/ConfigSidebar.tsx",
  "src/App.tsx"
]
autonomous: true
must_haves:
  truths:
    - "A categorized layout visually segregates different config segments."
    - "React Hook Form validates inputs live via Zod."
---

# Plan 1.2: Config Editor Layout & Form Validation

<objective>
To build the primary UI scaffolding for users to edit settings safely.

Purpose: To fulfill the visual editor requirement in a user-friendly way.
</objective>

<context>
Load for context:
- .gsd/ROADMAP.md
- src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Build Config View Layout</name>
  <files>
    src/features/config/components/ConfigSidebar.tsx
    src/features/config/components/ConfigEditor.tsx
  </files>
  <action>
    Create a standard master-detail view: a left sidebar for categories (LLM Providers, Server, Advanced) and a main content area.
    AVOID: Deeply nested, unmaintainable monolithic files. Split components clearly.
  </action>
  <verify>npm run lint</verify>
  <done>UI renders the sidebar and form containers correctly.</done>
</task>

<task type="auto">
  <name>Integrate React Hook Form</name>
  <files>src/features/config/components/ConfigEditor.tsx</files>
  <action>
    Wire `react-hook-form` and `@hookform/resolvers/zod` into `ConfigEditor.tsx`. Ensure changing fields live-validates. Connect valid form submissions to the `configStore.saveConfig()` method.
    AVOID: Allowing invalid states to reach the write-to-disk layer.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Forms render validation errors properly and persist safely when clean.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] App launches with the new Config UI accessible.
- [ ] Typing an invalid port string correctly shows a Zod validation error inline.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
