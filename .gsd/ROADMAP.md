# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 - Desktop Simplification

## Must-Haves (from SPEC)
- [ ] Pre-populate 3-4 major LLM providers in UI.
- [ ] Hardcode the most famous models for selected providers in a dropdown.
- [ ] Simplify Config page -> Only requires Provider, Model, and API Key to be saved.
- [ ] Fix underlying Gateway "invalid config" startup errors.

## Phases

### Phase 1: Frictionless Config UI
**Status**: ⬜ Not Started
**Objective**: Redesign the UI settings / config flow so a user simply selects a provider, a model, and enters an API key without dealing with raw JSON or complex variables.

### Phase 2: Gateway Configuration Fixes
**Status**: ⬜ Not Started
**Objective**: Ensure the local Gateway server properly consumes the simplified settings from the frontend without throwing "invalid config" errors on boot.

### Phase 3: Desktop Packaging & Polish
**Status**: ⬜ Not Started
**Objective**: Polish the Electron boot process and ensure the final product can be cleanly built and installed without exposing terminal output to the user.
