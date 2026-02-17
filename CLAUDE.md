# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                # Install all dependencies
npm run build              # Build all packages (sequential: tui → ai → coding-agent)
npm run check              # tsgo type check (requires build first)
bash ./scripts/test.sh     # Run all tests without API keys (unsets env vars, skips LLM-dependent tests)
bash ./scripts/pi-test.sh  # Run pi coding agent from source (must run from repo root)
```

**Never run:** `npm run dev`, `npm run build`, `npm test` (use the commands above instead).

**Running a single test** (from the package root, not repo root):

```bash
npx tsx ../../node_modules/vitest/dist/cli.js --run test/specific.test.ts
```

Exception: `pi-tui` uses Node's built-in test runner: `node --test --import tsx test/*.test.ts`

## Architecture

This is an npm workspaces monorepo. All packages share lockstep versioning.

### Package Dependency Graph

```
pi-ai (leaf — no internal deps)
  ↓
pi-coding-agent ← pi-tui
```

### Package Summaries

- **pi-ai** (`packages/ai`) — Unified multi-provider LLM streaming API. Normalizes 15+ providers (Anthropic, OpenAI, Google, Bedrock, etc.) into a standard `AssistantMessageEvent` stream. Core abstraction: `EventStream<T, R>` (async iterator with result extraction). Provider implementations live in `src/providers/`. Model catalog is auto-generated (`models.generated.ts` via `scripts/generate-models.ts`).

- **pi-tui** (`packages/tui`) — Terminal UI with differential rendering. `tui.ts` diffs component trees and emits minimal ANSI sequences. Key components: `editor.ts` (full text editor), `markdown.ts` (syntax-highlighted rendering), `keys.ts` (keyboard parsing). Overlay system for modals. Detects Kitty/iTerm2 for inline images.

- **pi-coding-agent** (`packages/coding-agent`) — The main `pi` CLI. Three run modes: interactive (TUI), print (headless stdout), RPC (JSON-RPC for IDEs). Core subsystems:
  - **Agent core** (`src/core/agent-core/`): Runtime loop, tool execution orchestration, message/event types
  - **Tools** (`src/core/tools/`): Read, Write, Edit, Bash, Grep, Find, Ls
  - **Extensions** (`src/core/extensions/`): Lifecycle hooks (`agent_start/end`, `turn_start/end`, `tool_call_event`, `input_event`, `context_event`), custom tools, slash commands, keybindings, UI widgets
  - **Sessions** (`src/core/session-manager.ts`): Tree-structured branching conversations with append-only log, compaction, and atomic writes
  - **Model registry** (`src/core/model-registry.ts`): Model discovery and API key management

## Build & Tooling

- **TypeScript compiler:** `tsgo` (`@typescript/native-preview`) — native TS compiler for speed. Each package has `tsconfig.build.json` extending `tsconfig.base.json`.
- **Root `tsconfig.json`:** Has path aliases for all `@mariozechner/*` packages pointing to source, enabling cross-package type checking without building.
- **Test framework:** Vitest for all packages except `pi-tui` (Node built-in test runner).

## Code Rules (from AGENTS.md)

- No `any` types unless absolutely necessary.
- **Never use inline/dynamic imports** — no `await import("./foo.js")`, no `import("pkg").Type`. Always use standard top-level imports.
- Never remove or downgrade code to fix type errors from outdated deps; upgrade the dependency instead.
- All keybindings must be configurable via `DEFAULT_EDITOR_KEYBINDINGS` or `DEFAULT_APP_KEYBINDINGS` — never hardcode key checks.
- Check `node_modules` for external API type definitions instead of guessing.

## Git & Commit Rules

- Only commit files you changed. Use `git add <specific-files>`, never `git add -A` or `git add .`.
- Commit message format: `type(scope): description` (e.g., `fix(ai): handle streaming abort`).
- Include `fixes #<number>` or `closes #<number>` when related to an issue/PR.
- Never use `git commit --no-verify`, `git reset --hard`, `git checkout .`, `git clean -fd`, or `git stash`.
- Do not edit `CHANGELOG.md` unless maintaining the `[Unreleased]` section. Never modify released version sections.

## Adding a New LLM Provider

Requires changes across multiple files — see AGENTS.md for the full checklist covering: types.ts (Api union + options), provider implementation, stream.ts integration, model generation script, tests (11+ test files), coding-agent model resolver, and documentation.

## Releasing

Lockstep versioning — all packages share the same version. `npm run release:patch` (fixes/features) or `npm run release:minor` (breaking changes). The script handles version bump, changelog finalization, commit, tag, and publish.
