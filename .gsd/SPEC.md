# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Transform the CLI/Gateway-heavy Clawdbot into `Quantumhook Desktop`: a beautifully packaged, easily installable, and flawless native application for ordinary users. It must eliminate technical friction, prevent disastrous misconfigurations, and just work out of the box.

## Goals
1. **Frictionless LLM Setup:** Implement an intuitive configuration UI for API keys and models.
2. **Curated Model Selection:** Provide 3-4 top-tier LLM providers out of the box with drop-downs for their most famous, reliable models.
3. **Flawless Desktop Experience:** Package the app to be smoothly installable and executable on local systems without exposing the user to terminal errors or manual node server management.

## Non-Goals (Out of Scope)
- Exposing complex local node configuration (ports, environments) to the end user.
- Supporting every obscure LLM provider (focus only on the top 3-4).
- Advanced plugin development within the user interface (for now).

## Users
Everyday end-users who want an autonomous AI agent on their desktop but lack the technical background to manually run Node servers, configure undocumented API payloads, or deal with `.env` files.

## Constraints
- **Technical constraints:** Must seamlessly bridge the React UI with the local background Gateway without user intervention.
- **Security constraints:** API keys must be stored securely and not exposed in logs or network requests maliciously.

## Success Criteria
- [ ] A user can open the settings UI, select a provider (e.g., OpenAI, Anthropic, Google), pick a model from a predefined dropdown, paste their key, and start chatting.
- [ ] No "invalid config" crashes or Gateway disconnects occur upon initial startup.
- [ ] The app is packagable into a standard desktop installer (e.g., `.dmg`, `.exe`, or AppImage) via Electron packager.
