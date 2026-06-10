# Upstream Sync Log

Use one section per sync cycle.

---

## Sync Cycle: 2026-06-10

### Metadata

- Sync branch: `sync/upstream-20260610-v0791`
- Worktree: `/Users/edouard/Developer/pi-upstream-sync-20260610-v0791`
- Operator: `codex-gpt-5`
- Started at: `2026-06-10`
- Completed at: `2026-06-10`
- Base branch/commit: `origin/main @ 4b6cf7a1`
- Upstream window:
  - from: `upstream/main @ 3b7448d1` (last selective-sync baseline recorded on `origin/main`)
  - to: `v0.79.1 @ 28df940f`

### Preflight Snapshot

- Original checkout: `/Users/edouard/Developer/pi` was dirty on `codex/pi-rust`; left untouched.
- Sync checkout: fresh worktree from `origin/main` on `sync/upstream-20260610-v0791`.
- Baseline checks before edits:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- Scope rule: selective retained-runtime imports only; no removed packages, docs/examples/tests, CI workflows, provider-family expansion, release wrappers, generated model churn, or dependency/package-lock churn.

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| AI provider/runtime fixes | manual | applied / partial | imported retained Anthropic, OpenAI, OpenAI Codex, OpenAI-compatible streaming/retry/context fixes; skipped new provider families and generated model churn |
| TUI wrapping/cursor/capability fixes | manual | applied / partial | imported wrapping, tab/CJK, autocomplete cursor marker, and terminal hyperlink capability fixes; larger history/keyboard/overlay API work stayed out |
| coding-agent runtime fixes | manual | applied / partial | imported auth permissions, reload queue mode sync, compaction prompt wording, SDK package fallback, and skill/user spacing; skipped trust-gating, extension API growth, broad package-manager churn, and absent migrations |

### Path Mapping Decisions

- Upstream AI paths under `packages/ai/src/**` map directly to the retained fork provider surface.
- Upstream `packages/agent/src/**` changes were not needed in this batch; no agent-core package surface was widened.
- Upstream coding-agent changes mapped only where matching local files and behavior already exist.
- `19060743` was skipped as not applicable: the fork's `packages/coding-agent/src/migrations.ts` does not contain the upstream `models.json` config-value migration function.
- Upstream package/version/release changes stayed out to preserve the minimized fork and avoid lockfile churn.

### Integration Batches

#### Batch 1: AI Providers

- Included upstream behavior:
  - OpenAI-compatible completions streaming: multiple interleaved tool-call deltas, finish-reason validation, and preserved OpenRouter cache accounting.
  - OpenAI Responses shared conversion: developer-role compatibility, stable synthetic text IDs, and reasoning text deltas.
  - OpenAI Codex Responses: configurable `maxRetries`, SSE header timeout, retry header delays, fallback instructions, and hyphenated `session-id` headers.
  - Anthropic/simple options: explicit `maxTokens` only, thinking-budget adjustment without implicit caps, and Opus 4.7 temperature omission.
  - Context overflow detection: additional OpenAI-compatible max-context wording.
- Files touched:
  - `packages/ai/src/providers/anthropic.ts`
  - `packages/ai/src/providers/openai-codex-responses.ts`
  - `packages/ai/src/providers/openai-completions.ts`
  - `packages/ai/src/providers/openai-responses-shared.ts`
  - `packages/ai/src/providers/simple-options.ts`
  - `packages/ai/src/types.ts`
  - `packages/ai/src/utils/abort-signals.ts`
  - `packages/ai/src/utils/overflow.ts`
  - `packages/ai/CHANGELOG.md`
- Verification:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)

#### Batch 2: TUI

- Included upstream behavior:
  - ANSI wrapping avoids spread-push stack overflow on large wrapped text.
  - CJK text can wrap at grapheme boundaries and tabs count as three columns consistently.
  - Editor keeps the hardware cursor marker active while autocomplete is open.
  - Terminal hyperlink support is detected conservatively, with explicit Windows Terminal support and tmux probing.
- Files touched:
  - `packages/tui/src/components/editor.ts`
  - `packages/tui/src/terminal-image.ts`
  - `packages/tui/src/utils.ts`
  - `packages/tui/CHANGELOG.md`
- Verification:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)

#### Batch 3: Coding Agent

- Included upstream behavior:
  - Auth file writes request `0600` permissions at creation/write time.
  - Runtime reload re-syncs steering and follow-up queue modes from settings.
  - Compaction summarization prompt no longer frames every transcript as a coding-assistant conversation.
  - Embedded SDK startup tolerates missing package metadata.
  - Skill invocation rendering inserts spacing before the follow-up user message.
- Files touched:
  - `packages/coding-agent/src/config.ts`
  - `packages/coding-agent/src/core/agent-session.ts`
  - `packages/coding-agent/src/core/auth-storage.ts`
  - `packages/coding-agent/src/core/compaction/utils.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/CHANGELOG.md`
- Verification:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| generated models and version/release commits | catalog/release churn outside selected runtime fixes | dedicated model/release refresh |
| new provider families / image APIs / broader compat maps | would widen this minimized fork's public surface | explicit provider expansion request |
| docs/examples/tests/CI workflows | intentionally removed from fork | docs/test restoration request |
| large package-manager/trust/extension API changes | broad behavior and surface growth beyond retained runtime fixes | dedicated extension/security-platform pass |
| TUI large keyboard/history/overlay API work | higher-risk behavioral expansion; only selected matching fixes were ported | concrete bug report in those flows |
| `19060743` models.json migration | target migration helper absent locally | revisit only if local migration layer grows to match upstream |

### Verification Results

- `git diff --check`: passed.
- `npm run check`: passed after AI, TUI, and coding-agent batches.
- `./scripts/pi-test.sh --version`: passed after AI, TUI, and coding-agent batches; output remained `0.52.12`.
- Final `git status --short`: expected modified sync files plus new `packages/ai/src/utils/abort-signals.ts`; no unrelated worktree changes.
- Final `npm run check`: passed.
- Final `./scripts/pi-test.sh --version`: passed (`0.52.12`).
- Final tmux interactive smoke: passed. Source launch rendered the TUI, footer showed `sync/upstream-20260610-v0791`, and typing `@` opened path autocomplete suggestions.

### Final Summary

- Imported retained runtime fixes from the `3b7448d1..v0.79.1` upstream window through upstream tag `v0.79.1`.
- Preserved the minimized fork boundary: no removed packages/docs/examples/tests, no broad provider expansion, no lockfile churn, and no release/version updates.
- Remaining work is final verification and any follow-up pass the fork explicitly wants for broader extension/security/trust surfaces.

---

## Sync Cycle: 2026-04-08

### Metadata

- Sync branch: `sync/upstream-20260408-r6`
- Operator: `codex-gpt-5`
- Started at: `2026-04-08`
- Completed at: `2026-04-08`
- Base branch/commit: `main @ 8ebe54d0`
- Upstream window:
  - from: `84d13406` (post-R5 audited upstream main)
  - to: `upstream/main @ 3b7448d1`

### Preflight Snapshot

- `git status --short --branch` summary: clean working tree on `main`; branched to `sync/upstream-20260408-r6` before edits.
- `git worktree list --verbose` summary: one live worktree only, on this repo.
- `git log --oneline main..HEAD` / `git diff --name-status main..HEAD`: empty before R6 work began.
- Notable local divergence notes:
  - preserve minimized fork shape; do not reintroduce removed docs/examples/tests/packages
  - provider scope remains limited to Anthropic, OpenAI, OpenAI Codex, and OpenAI-compatible flows already central to this fork
  - include the resource precedence semantic change intentionally in this pass

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| tranche A runtime / CLI / session fixes | mixed | applied / partial | `127547f2`, `080af6fc`, `52d16d5a`, `72a43dc0`, `f10cce94`, and `61015830` landed; `377eca96` was partial because the upstream `scripts/session-transcripts.ts` path does not exist locally |
| tranche B resource precedence / theme watcher | mixed | applied / audit | `a7acef92` and `5e5eeb96` landed; `71e44369` was audit-only in this fork |
| tranche C provider / auth polish | mixed | applied / partial | `6044cabb` and `f05f4e8a` landed directly; `96916f2c` was ported as Anthropic warning behavior only, with Earendil churn intentionally skipped |
| tranche D TUI stability | manual | applied | `6f5f37f8` and `3b7448d1` landed as direct local behavior ports |

### Path Mapping Decisions

- Upstream `packages/coding-agent/src/core/agent-session-runtime.ts` behavior from `080af6fc` mapped into this fork’s `packages/coding-agent/src/core/agent-session.ts`.
- Upstream `packages/coding-agent/src/core/session-cwd.ts` does not exist locally, so this cycle added the local equivalent directly at `packages/coding-agent/src/core/session-cwd.ts`.
- Upstream `377eca96` was split: the runtime `readline -> node:readline` changes landed, but the `scripts/session-transcripts.ts` piece stayed out because that script does not exist in this fork.
- `71e44369` stayed audit-only because this fork no longer has the upstream `resource-loader` missing-path warning loops it fixed, and `parseSource()` already behaves compatibly for package-source classification.
- `96916f2c` stayed intentionally narrow: only the Anthropic subscription-auth warning behavior landed. No Earendil assets, startup announcement component, or date-gated notice flow were imported.

### Integration Batches

#### Tranche A

- Included commits:
  - `127547f2`
  - `080af6fc`
  - `52d16d5a`
  - `72a43dc0`
  - `377eca96` (partial)
  - `f10cce94`
  - `61015830`
- Outcome: applied / partial
- Files touched:
  - `packages/ai/src/cli.ts`
  - `packages/coding-agent/src/cli.ts`
  - `packages/coding-agent/src/core/agent-session.ts`
  - `packages/coding-agent/src/core/bash-executor.ts`
  - `packages/coding-agent/src/core/session-cwd.ts`
  - `packages/coding-agent/src/core/session-manager.ts`
  - `packages/coding-agent/src/core/tools/bash.ts`
  - `packages/coding-agent/src/main.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/src/modes/rpc/rpc-client.ts`
  - `packages/coding-agent/src/modes/rpc/rpc-mode.ts`
- Notes:
  - piped stdin no longer forces print mode when `--json` / explicit mode is already selected
  - missing session cwd now surfaces a recoverable fallback in interactive mode and a hard failure in non-interactive mode
  - truncated bash output now persists to temp files even when truncation came from the rolling display buffer
  - RPC child stderr is forwarded in real time
  - runtime `readline` imports now use `node:readline`
  - retryable error detection now includes “ended without” stream failures
  - startup now exports `PI_CODING_AGENT=true`

#### Tranche B

- Included commits:
  - `a7acef92`
  - `5e5eeb96`
- Audit-only commits:
  - `71e44369`
- Outcome: applied / audit
- Files touched:
  - `packages/coding-agent/src/core/package-manager.ts`
  - `packages/coding-agent/src/core/resource-loader.ts`
  - `packages/coding-agent/src/modes/interactive/theme/theme.ts`
- Notes:
  - resolved resource arrays are now sorted by explicit precedence before first-wins collision handling
  - CLI-provided skills / prompts / themes are prepended instead of appended
  - theme watcher now survives async `fs.watch` error events without crashing the session

#### Tranche C

- Included commits:
  - `6044cabb`
  - `f05f4e8a`
  - `96916f2c` (warning-only partial)
- Outcome: applied / partial
- Files touched:
  - `packages/ai/src/providers/openai-completions.ts`
  - `packages/ai/src/types.ts`
  - `packages/coding-agent/src/core/model-registry.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
- Notes:
  - OpenAI-compatible usage accounting now preserves `cache_write_tokens`
  - OpenRouter routing type/schema now matches the fields the runtime already forwards
  - Anthropic subscription auth now emits a one-time warning in the minimized interactive flow
  - Earendil notice behavior remained out of scope

#### Tranche D

- Included commits:
  - `6f5f37f8`
  - `3b7448d1`
- Outcome: applied
- Files touched:
  - `packages/tui/src/tui.ts`
- Notes:
  - render scheduling is now throttled under streaming load
  - `Container.render()` no longer uses spread-push on large child arrays, avoiding stack overflow on deep / large transcripts

Explicit defers for this cycle:

- `4f7fc9de`
- `ee2483cd`
- `b48d8029`
- `a9bd8045`
- `6d2d03dc`
- `cca5a3a1`
- `82ecc130`
- `773f91f4`
- `70fb83fc`
- `db31c16b`
- release wrapper / generated model churn / docs-only commits

### Verification Results

- `npm run check`: passed after tranche A, tranche B, tranche C, tranche D, and the final post-fix rerun
- `./scripts/pi-test.sh --version`: passed after tranche A, tranche B, tranche C, tranche D, and the final post-fix rerun; output remained `0.52.12`
- `./scripts/rebuild-local-pi.sh`: passed after integration and again after the final `agent-session` retry-regex patch
- `pi --version`: `0.52.12`
- `realpath $(command -v pi)`: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- `git diff --check`: passed
- Targeted smokes:
  - `npx tsx` large-array `Container.render()` probe returned `200000` lines without stack overflow
  - `npx tsx` OpenRouterRouting type probe compiled with extended routing fields
  - tmux startup capture rendered a stable interactive session after the TUI changes
  - attempted piped `--print --json` smoke against local `ollama/gemma4:31b` failed with `Connection error`, so end-to-end JSON-output preservation was not validated against a live provider on this machine

### Final Summary

- R6 landed as a real post-R5 bugfix/polish sweep without widening the fork’s package or provider surface.
- The high-signal changes were: missing-session-cwd recovery, print/json stdin preservation, durable truncated bash output capture, real-time RPC stderr forwarding, resource precedence correction, OpenRouter routing schema parity, Anthropic subscription-auth warning behavior, render throttling, and the large-array `Container.render()` stack fix.
- `71e44369` was intentionally downgraded to audit-only, and `96916f2c` / `377eca96` were both split to keep only the runtime behavior that still fits this minimized fork.
- Remaining limitations after this cycle:
  - provider-dependent smokes were only partially exercised on this machine
  - no Earendil/startup-announcement churn, new provider families, docs/examples/tests, or broader extension/runtime-host surface were imported

---

## Sync Cycle: 2026-04-03

### Metadata

- Sync branch: `sync/upstream-20260403-r5`
- Operator: `codex-gpt-5`
- Started at: `2026-04-03`
- Completed at: `2026-04-03`
- Base branch/commit: `main @ 103d3634`
- Upstream window:
  - from: `103d3634` (post-R4 local main)
  - to: `upstream/main @ 84d13406`

### Preflight Snapshot

- `git status --short --branch` summary: clean working tree on `main`; branched to `sync/upstream-20260403-r5` before edits.
- `git worktree list --verbose` summary: one live worktree only.
- `git log --oneline main..HEAD` / `git diff --name-status main..HEAD`: empty before R5 work began.
- Notable local divergence notes:
  - preserve minimized fork shape; do not reintroduce removed docs/examples/tests/packages
  - provider scope remains limited to Anthropic, OpenAI, OpenAI Codex, and OpenAI-compatible flows already central to this fork
  - treat already-present local equivalents as `audit-only` and do not re-port them

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| tranche A startup / extension correctness / footer stability | mixed | applied/audited | ported only the missing runtime deltas; pre-existing equivalents stayed audit-only |
| tranche B platform / desktop polish | mixed | applied/partial | imported runtime behavior only; skipped absent local `src/bun/cli.ts` and upstream-only test scaffolding |
| tranche C broader TUI polish | manual | applied | imported only behavior fixes for width, watcher reload, and wide-char rendering |
| `617f1870` reuse initial resource loader | audit | already present | local startup already reuses the first resource loader instead of rebuilding it |
| `58f8fcd8` retry sync lock acquisition | audit | already present | local auth/settings storage already retries lock acquisition on startup |
| `e0f85a3b` invalid provider registrations | split manual | partial | provider registration isolation ported; upstream footer-side effects did not map 1:1 and were superseded by the local `2d05e872` footer port |
| `31c7406a` suppress process warnings | partial manual | partial | applied to `src/cli.ts`; upstream `src/bun/cli.ts` does not exist in this fork |

### Path Mapping Decisions

- Upstream runtime paths under `packages/coding-agent/src/**` and `packages/tui/src/**` continue to map directly where those files still exist in the fork.
- Upstream fixes that assume broader editor, extension-host, or platform surface are ported behaviorally only when the narrower local shape can absorb them safely.
- Docs/examples/tests and removed packages remain out of scope even when adjacent runtime commits are imported manually.

### Integration Batches

#### Tranche A

- Target window: `post-R4 startup / extension correctness / footer stability backlog`
- Included commits:
  - `1ba899f6`
  - `e0f85a3b` (behavioral partial port)
  - `a8a58ff2`
  - `80ca61a1`
- Audit-only commits:
  - `617f1870`
  - `58f8fcd8`
- Integration mode: mixed manual port + audit
- Files touched:
  - `docs/upstream-sync-log.md`
  - `packages/coding-agent/src/core/agent-session.ts`
  - `packages/coding-agent/src/core/extensions/loader.ts`
  - `packages/coding-agent/src/core/extensions/runner.ts`
  - `packages/coding-agent/src/core/extensions/types.ts`
  - `packages/coding-agent/src/core/model-registry.ts`
  - `packages/coding-agent/src/core/resource-loader.ts`
  - `packages/coding-agent/src/main.ts`
  - `packages/coding-agent/src/modes/interactive/components/tool-execution.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/src/modes/rpc/rpc-mode.ts`
- Outcome: applied/audited
- Notes:
  - duplicate extension slash commands now resolve deterministically via suffixed invocation names
  - built-in tool overrides now fall back to built-in formatting for whichever render half the override does not provide
  - invalid extension provider registrations now fail in isolation instead of poisoning the full registration pass
  - interactive UI startup now completes before `session_start`

#### Tranche B

- Target window: `platform / desktop polish backlog`
- Included commits:
  - `25b185f3`
  - `a0396e1f`
  - `31c7406a` (partial local port only)
  - `2d05e872`
- Integration mode: mixed manual port + behavioral adaptation
- Files touched:
  - `packages/coding-agent/src/cli.ts`
  - `packages/coding-agent/src/core/exec.ts`
  - `packages/coding-agent/src/core/footer-data-provider.ts`
  - `packages/coding-agent/src/core/tools/bash.ts`
  - `packages/coding-agent/src/utils/child-process.ts`
  - `packages/coding-agent/src/utils/clipboard.ts`
- Outcome: applied
- Notes:
  - child-process waits now avoid inherited stdio hangs by explicitly draining and destroying lingering pipes
  - clipboard fallbacks stay quiet in headless sessions instead of surfacing noisy errors
  - CLI warning suppression was applied only where the local fork has a matching entrypoint
  - footer branch detection now handles reftable repos and worktree `.git` indirection correctly

#### Tranche C

- Target window: `broader TUI polish backlog`
- Included commits:
  - `77db2e4c`
  - `3620adb3`
  - `48e4bd94`
  - `15e0957b`
  - `aaeb2d82`
- Integration mode: manual port
- Files touched:
  - `packages/coding-agent/src/modes/interactive/theme/theme.ts`
  - `packages/tui/src/components/editor.ts`
  - `packages/tui/src/components/input.ts`
  - `packages/tui/src/utils.ts`
- Outcome: applied
- Notes:
  - large-string truncation now streams width accounting instead of rescanning full strings
  - theme reload uses a debounced directory watcher and keeps the last good theme during transient file states
  - editor/input rendering now handles wide characters and wrap boundaries without overrunning the visible column budget

### Verification Results

- `npm run check`: passed
- `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- `./scripts/rebuild-local-pi.sh`: passed
- `pi --version`: passed (`0.52.12`)
- `command -v pi`: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- `git diff --check`: clean
- Targeted smokes: passed
  - duplicate slash-command disambiguation resolved `/foo`, `/foo:2`, and built-in collisions deterministically
  - invalid provider registration isolation emitted extension-scoped errors and drained the queue cleanly
  - two parallel `./scripts/pi-test.sh --version` launches completed without false lockfile failures
  - headless clipboard probe stayed quiet while still producing OSC52 output
  - reftable footer probe tracked branch changes correctly
  - theme watcher probe reloaded a custom theme after an on-disk edit
  - wide-char editor/input and large-string truncation probes stayed width-correct
  - built-in tool override fallback preserved the custom-renderer path while still filling missing render halves from built-in output
- Risk note:
  - `npm run check` did not catch an intermediate duplicate-helper regression in `packages/tui/src/utils.ts`; the runtime probes and `./scripts/pi-test.sh --version` did catch it, so final verification for TUI-heavy sync work should keep both compile-time and runtime gates

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `7c92bb81` | example-only | ignore unless this fork starts carrying examples again |
| `bd2c3ab6` | larger editor feature-style change than this pass should absorb | revisit only if the fork intentionally broadens editor behavior |
| `9f9277cc`, `d86122cb`, `e2f29b05`, `de022ceb`, `ef6af5eb`, `b5f425ad`, `20a57e75` | architecture / extension-surface growth outside minimized-fork scope | consider only if the fork intentionally broadens runtime/extension APIs |
| net-new provider families and broader runtime-host / extension architecture work | out of R5 scope and not justified by the fork’s first-class surface | revisit only if this fork expands provider/runtime surface intentionally |

### Final Summary

- What was imported:
  - deterministic duplicate slash-command resolution and safer extension-provider registration handling
  - built-in tool override fallback to built-in renderers for missing custom-renderer halves
  - interactive startup ordering, reftable-aware footer branch detection, quieter clipboard fallbacks, and safer child-process waiting
  - large-string truncation, custom-theme live reload, and wide-character editor/input stability fixes
- What was intentionally skipped:
  - example-only work
  - broader editor feature churn
  - net-new providers and runtime/extension architecture growth
  - removed docs/examples/tests/packages
- Follow-up tasks:
  - if another sync pass is needed, start by treating `617f1870` and `58f8fcd8` as already landed locally
  - keep runtime probes in the verification gate for any future TUI-heavy sync work

---

## Sync Cycle: 2026-04-03

### Metadata

- Sync branch: `sync/upstream-20260403-r4`
- Operator: `codex-gpt-5`
- Started at: `2026-04-03`
- Completed at: `2026-04-03`
- Base branch/commit: `main @ ddf9d701`
- Upstream window:
  - from: `ddf9d701` (post-R3 local main)
  - to: `upstream/main @ 84d13406`

### Preflight Snapshot

- `git status --short` summary: clean working tree on `main`; branched to `sync/upstream-20260403-r4` before edits.
- Notable local divergence notes:
  - preserve minimized fork shape; do not reintroduce removed docs/examples/tests/packages
  - provider scope remains limited to Anthropic, OpenAI, OpenAI Codex, and OpenAI-compatible flows already central to this fork
  - upstream advanced to `v0.65.0`, but this pass stays bounded to the approved R4 workflow/runtime polish scope rather than widening into new architecture

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| tranche A edit/write ordering + compaction safety | manual | applied | queued same-file `edit`/`write`, truncated tool-result compaction input, and guarded stale pre-compaction threshold checks |
| tranche B workflow/session/runtime polish | mixed | applied/audited | most JSONL/export/runtime polish was already present locally; remaining delta was small and minimization-safe |
| tranche C first-class provider/runtime fixes | mixed | applied/audited | provider scope stayed limited to Anthropic/OpenAI/Codex/OpenAI-compatible flows; several fixes were already present |
| `0f9db44a` large edit redraw | audit | no-op | upstream fix targets newer edit preview rendering not present in this fork’s smaller edit tool |
| `fa26f15e` session-switch scrollback clearing | audit | already present | local `packages/tui/src/tui.ts` already clears screen before dropping scrollback |

### Path Mapping Decisions

- Upstream runtime paths under `packages/coding-agent/src/**`, `packages/tui/src/**`, and `packages/ai/src/**` continue to map directly where those files still exist in the fork.
- Upstream commits that depend on newer edit-tool surface area are ported behaviorally only, if at all; this fork keeps its older, smaller edit tool shape unless the fix materially requires more.
- Docs/examples/tests and removed packages remain out of scope even when adjacent runtime commits are imported manually.

### Integration Batches

#### Tranche A

- Target window: `post-r3 .. workflow/runtime polish backlog`
- Included commits:
  - `d38ad0cd`
  - `74a46fc7`
  - `c950c692`
  - `d1a17bba` (behavioral partial port only)
- Integration mode: manual port
- Files touched:
  - `docs/upstream-sync-log.md`
  - `packages/coding-agent/src/core/tools/file-mutation-queue.ts`
  - `packages/coding-agent/src/core/tools/edit.ts`
  - `packages/coding-agent/src/core/tools/write.ts`
  - `packages/coding-agent/src/core/compaction/utils.ts`
  - `packages/coding-agent/src/core/agent-session.ts`
- Outcome: applied

#### Tranche B

- Target window: `workflow/session/runtime polish`
- Included commits:
  - `fd385ecf`
  - `970774ec`
  - `84655e81`
  - `fa26f15e` (audit only)
  - `ce15f407`
  - `4f81c3c2`
  - `8a0529ed`
- Integration mode: mixed manual port + audit
- Files touched:
  - `packages/coding-agent/src/core/slash-commands.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/src/modes/interactive/components/model-selector.ts`
  - `packages/coding-agent/src/core/extensions/loader.ts`
  - `packages/coding-agent/src/core/package-manager.ts`
  - `packages/coding-agent/src/core/resolve-config-value.ts`
  - `packages/coding-agent/src/core/tools/find.ts`
  - `packages/coding-agent/src/utils/clipboard.ts`
  - `packages/coding-agent/src/utils/clipboard-native.ts`
  - `packages/tui/src/autocomplete.ts`
- Outcome: applied/audited
- Notes:
  - JSONL export/import, async `/copy`, extension alias preference, native clipboard text copy, and most Windows path handling were already present in the branch-local R4 sweep and verified rather than re-ported.
  - The remaining explicit local delta in this turn was the scoped fuzzy autocomplete normalization fix for backslash-separated queries.

#### Tranche C

- Target window: `first-class provider/runtime polish`
- Included commits:
  - `ad48b52d`
  - `e645995a` (simplified local-equivalent port)
  - `dd53eb56`
  - `b2548ce4`
  - `45354153`
  - `a79ca411`
- Integration mode: mixed manual port + audit
- Files touched:
  - `packages/ai/src/types.ts`
  - `packages/ai/src/providers/anthropic.ts`
  - `packages/ai/src/providers/openai-completions.ts`
  - `packages/ai/src/providers/openai-responses-shared.ts`
  - `packages/ai/src/providers/openai-codex-responses.ts`
  - `packages/ai/src/utils/oauth/anthropic.ts`
- Outcome: applied/audited
- Notes:
  - `39b1bf7b` was already present locally (`request_too_large` overflow detection), so it remained audit-only.
  - Anthropic OAuth stayed in the fork’s smaller manual flow shape while still picking up the relevant token endpoint / redirect parsing fixes.

### Verification Results

- `npm run check`: passed
- `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- `./scripts/rebuild-local-pi.sh`: passed
- `pi --version`: passed (`0.52.12`)
- `command -v pi`: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- `git diff --check`: clean
- Queue regression smoke: passed
  - concurrent `write` + `edit` against the same new file completed in order and produced the expected final content
- Autocomplete normalization smoke: passed
  - helper-level probe confirmed scoped fuzzy queries and display paths normalize backslashes to forward slashes
- Not fully exercised end-to-end in this turn:
  - live-provider Codex / Anthropic transport flows
  - full interactive `/export` + `/import` round-trip through tmux
  - desktop-native clipboard write on a real GUI session

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `0f9db44a` | local edit tool does not have the upstream preview rendering surface that the fix targeted | only revisit if the edit tool grows that preview path later |
| `e2f29b05`, `de022ceb`, `d86122cb`, `ef6af5eb`, `b5f425ad`, `20a57e75` | architecture / extension-surface growth outside minimized-fork scope | consider only if the fork intentionally broadens runtime/extension APIs |
| net-new provider families and broader model/registry churn | out of R4 scope and not justified by the fork’s first-class provider surface | revisit only if this fork adopts those providers as first-class |

### Final Summary

- What was imported:
  - same-file mutation queueing for `edit` / `write`
  - compaction summarization truncation and stale pre-compaction threshold guarding
  - bounded workflow/runtime polish already accumulated on the branch (`/import`, JSONL export/import, async `/copy`, scoped model refresh, extension alias preference, Windows path normalization)
  - first-class provider/runtime polish already accumulated on the branch (response IDs, Responses tool-call ID normalization, `choice.usage` fallback, unknown `finish_reason` handling, Codex SSE/WS header split, Anthropic OAuth parsing/token endpoint updates)
- What was intentionally skipped:
  - upstream-only edit preview redraw work that does not map to this fork
  - net-new providers and broader runtime/extension architecture changes
  - removed docs/examples/tests/packages
- Risk notes:
  - several R4 items were already present in the branch-local sweep before this turn’s final verification, so this cycle mixed fresh edits with audit/confirmation work
  - the branch is compile-clean and rebuilt locally, but not every provider-specific live flow was exercised against a real authenticated backend in this turn
- Follow-up tasks:
  - run one authenticated tmux smoke for `/export ...jsonl` then `/import ...jsonl`
  - run one authenticated Codex transport regression probe if Codex websocket behavior is still a concern

---

## Sync Cycle: 2026-04-02

### Metadata

- Sync branch: `sync/upstream-20260402-r3`
- Operator: `codex-gpt-5`
- Started at: `2026-04-02`
- Completed at: `2026-04-02`
- Base branch/commit: `main @ c185befb`
- Upstream window:
  - from: `v0.62.0`
  - to: `upstream/main`

### Preflight Snapshot

- `git status --short` summary: clean working tree on `main`; branched to `sync/upstream-20260402-r3` before edits.
- Notable local divergence notes:
  - preserve minimized fork shape; do not reintroduce removed docs/examples/tests/packages
  - provider family surface remains fixed to Anthropic, OpenAI/Codex, and OpenAI-compatible flows already present locally
  - existing local `sessionDir`, JSONL/share foundation, and extension compatibility are audit points, not green lights for wider surface growth

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| tranche A runtime/TUI/export/session fixes | manual | applied | bounded `v0.62.0..v0.63.0` ports only |
| tranche B compaction/package-manager/render fixes | manual | applied | imported only the missing runtime/TUI deltas |
| tranche C provider/export/render fixes | mixed | applied/audited | some commits were already present locally, others were ported |
| `4c7df25d` blockquote style-prefix fix | audit | no-op | local `packages/tui/src/components/markdown.ts` already uses the quote style prefix |
| `f456a7a4` | split audit | partial no-op | interactive compaction-summary half already present; edit-tool preview half does not map to local edit-tool shape |
| `7e1dd888` | audit | already present | local `sendExtensionMessage()` already uses `source: "extension"` |
| `2f8019b6` | manual | applied | emit the missing synthetic `toolcall_delta` when arguments only arrive in `.done` |
| `39b1bf7b` | manual | applied | classify Anthropic structured `request_too_large` errors as overflow |
| `09e9de57` | manual | applied | strip trailing default style prefixes after inline markdown rendering |

### Path Mapping Decisions

- Upstream `packages/coding-agent/src/**`, `packages/tui/src/**`, and `packages/ai/src/**` continue to map directly where the runtime files still exist locally.
- Root/session script changes continue to map into local `scripts/**` when relevant.
- Upstream docs/examples/tests and removed packages remain out of scope even when adjacent runtime commits are ported manually.

### Integration Batches

#### Tranche A

- Target window: `v0.62.0..v0.63.0`
- Included commits:
  - `de29f653`
  - `d08ab9b9`
  - `cb4e4d8c`
  - `0406b41a`
  - `21950c5b`
  - `4c7df25d`
  - `a949490f`
  - `ebe43708`
  - `2b1fc90c`
- Integration mode: manual port
- Files touched:
  - `docs/upstream-sync-log.md`
  - `packages/coding-agent/package.json`
  - `packages/coding-agent/src/core/export-html/index.ts`
  - `packages/coding-agent/src/core/settings-manager.ts`
  - `packages/coding-agent/src/main.ts`
  - `packages/coding-agent/src/modes/interactive/components/bash-execution.ts`
  - `packages/coding-agent/src/modes/print-mode.ts`
  - `packages/tui/src/autocomplete.ts`
  - `packages/tui/src/components/editor.ts`
  - `packages/tui/src/tui.ts`
- Outcome: successful

#### Tranche B

- Target window: `v0.63.0..v0.64.0`
- Included commits:
  - `a0734bd1` (manual split)
  - `eeace797`
  - `1ee0d28d`
  - `49c0d860`
  - `8c640588`
- Audited but not re-ported:
  - `f456a7a4` (interactive half already present locally; edit-tool half not applicable)
  - `7e1dd888` (already present locally)
- Integration mode: manual port
- Files touched:
  - `packages/coding-agent/src/core/agent-session.ts`
  - `packages/coding-agent/src/core/compaction/compaction.ts`
  - `packages/coding-agent/src/core/package-manager.ts`
  - `packages/coding-agent/src/core/tools/edit-diff.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/tui/src/keys.ts`
  - `packages/tui/src/tui.ts`
- Outcome: successful

#### Tranche C

- Target window: `v0.64.0..upstream/main`
- Included commits:
    - `2f8019b6`
    - `39b1bf7b`
    - `af124642`
    - `a1e10789`
    - `09e9de57`
    - `21863d4e`
- Audited but not re-ported:
    - `5ce0d15b` (already present locally via `resolveVarRefs()` in `getThemeExportColors()`)
- Integration mode: manual port plus audit
- Files touched:
    - `packages/coding-agent/src/core/agent-session.ts`
    - `packages/coding-agent/src/core/extensions/types.ts`
    - `packages/ai/src/providers/openai-responses-shared.ts`
    - `packages/ai/src/utils/overflow.ts`
    - `packages/tui/src/autocomplete.ts`
    - `packages/tui/src/components/editor.ts`
    - `packages/tui/src/components/markdown.ts`
    - `packages/tui/src/tui.ts`
  - Outcome: successful

### Verification Results

- Tranche A gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- Temp-dir launcher smoke:
  - `bash /Users/edouard/Developer/Organelle/pi/scripts/pi-test.sh --version` from a fresh temp directory: passed (`0.52.12`)
  - unexpected `.pi/` directory creation: not observed
- Settings-driven `sessionDir` smoke:
  - project `.pi/settings.json` with `sessionDir` created one session file in the configured external directory
  - local project `.pi/` contained only the settings file; session storage did not fall back to the project directory
- Interactive tmux smoke:
  - `/th` + `Tab` completed to `/skill:smithery-ai-cli` without chaining into argument autocomplete
  - `@packages/tui/src/co` surfaced file suggestions promptly in the repo tree
  - resizing the pane from `28` rows to `16` and back preserved the visible autocomplete viewport without corruption
  - bash preview rendered a wrapped collapsed output block for a `40 x 140` line shell command without visual breakage
- Tranche B gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- Tranche C gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- Targeted dist smoke checks:
    - async slash argument completion awaited correctly and returned `found` from an async `/demo fo` completion source
    - kitty keypad normalization inserted `2` from `\x1b[57401;1u` in the live editor input path
    - bundled dark-theme export colors resolved through `getThemeExportColors()` and returned non-empty `pageBg/cardBg/infoBg` values
    - OpenAI Responses emitted the missing final `toolcall_delta` (`1,"b":2}`) when arguments only completed in `response.function_call_arguments.done`
    - Anthropic `request_too_large` 413 errors classified as overflow
    - repeated-compaction prep retained the previous summary and summarized from the prior `firstKeptEntryId` boundary instead of starting after the compaction marker
    - print-mode emitted `session_shutdown` in `finally`
    - markdown inline rendering no longer left a trailing default ANSI style prefix at the end of the rendered line
    - live tmux pass stayed mounted through startup, raw `Escape`, and an `80x24 -> 100x30 -> 80x24` resize cycle

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| post-`v0.62.0` provider-surface growth | preserve minimized fork scope | revisit only in a dedicated provider pass |
| `d38ad0cd`, `e773527b`, `0f9db44a` | file-mutation churn beyond the chosen sweep | revisit in a dedicated edit/write stability pass |
| `7a786d88` | broad model/auth/registry churn | revisit only if model-registry work becomes blocking |
| `13b771e5` | package-update polish outside minimized core behavior | low priority |
| `84d2b51a`, `835296b1` | tree metadata and low-value RPC additions | revisit only if tree UX becomes a priority |
| `bc8eb74b`, `a3bf1eb3`, `bab58f82`, `758ede4d`, `6d744f02`, `17625cc8` | provider work outside the fork's first-class surface | only in a dedicated provider pass |
| `20a57e75`, `7d4faa08`, `b5f425ad`, `ef6af5eb`, `de022ceb`, `d86122cb`, `e2f29b05` | extension/runtime architecture expansion | not minimization-friendly |
| release/docs/changelog/tests-only commits | out of scope for minimized sync sweeps | skip by default |

### Final Summary

  - What was imported:
    - post-`v0.62.0` runtime correctness in skill discovery, repeated compaction boundaries, queued-message UI updates, retry settling, cell-size input handling, overlay height bounding, keypad functional keys, async slash argument completions, OpenAI Responses done-delta recovery, Anthropic overflow classification, and markdown ANSI cleanup
- What was intentionally skipped:
  - new provider families, extension/runtime architecture growth, wide model/auth churn, and file-mutation refactors beyond the explicitly chosen bugfixes
- Risk notes:
  - the remaining upstream backlog is now mostly narrower bugfix and architecture churn; the next useful sync should be a much smaller `r4` rather than another broad sweep
- Follow-up tasks:
  - consider a narrow `r4` for post-`v0.62.0` residual bugfixes like file-mutation ordering only if they show up in real usage on this fork

---

## Sync Cycle: 2026-04-02

### Metadata

- Sync branch: `sync/upstream-20260402-r2-aggressive`
- Operator: `codex-gpt-5`
- Started at: `2026-04-02`
- Completed at: `2026-04-02`
- Base branch/commit: `sync/upstream-20260401-r1 @ c579acc8` (working stand-in for `main` after tranche 1 lands)
- Upstream window:
  - from: `v0.55.0`
  - to: `v0.62.0`

### Preflight Snapshot

- `git status --short` summary: carried forward tranche-1 runtime edits in `docs/upstream-sync-log.md`, `src/core/model-resolver.ts`, `src/core/settings-manager.ts`, `src/modes/interactive/interactive-mode.ts`, and `src/modes/interactive/components/tool-execution.ts`; untracked `.codex/` and `scripts/rebuild-local-pi.sh` intentionally left out of upstream diff classification.
- Notable local divergence notes:
  - aggressive pass remains selective; no removed docs/examples/tests/packages are to be reintroduced
  - provider family surface stays fixed to the fork's existing provider set
  - local fork already contains some upstream-era features (`ModelRegistry`, `sessionDir`, `.agents` discovery, JSONL/share-export foundation), so these are treated as dependency audits rather than new imports

### Commit/Feature Triage

| Area | Classification | Decision | Notes |
| --- | --- | --- | --- |
| `branchSummary.skipPrompt` | manual | applied | skip branch-summary prompt when navigating from `/tree` |
| `treeFilterMode` | manual | applied | persisted default `/tree` filter plus settings UI surface |
| `--fork` session flag | manual | applied | CLI flag with partial-UUID/path resolution and forked session creation |
| custom session IDs | manual | applied | `SessionManager.newSession({ id })` compatibility hook |
| portable `scripts/pi-test.sh` | manual | applied | local `tsx` launcher works from outside repo cwd |
| auth/settings lock retries | manual | applied | tolerate transient `.lock` contention during local concurrent access |
| CLI extension precedence + user-scoped `.agents` | manual | applied | explicit `-e` wins; ancestor `~/.agents` no longer treated as project-local |
| tmux/input/render correctness | manual | applied | tmux keyboard warning, full redraw on height changes, key parsing/autocomplete improvements |
| select-list layout + stale scrollback clear + safe image resize limits | manual | applied | contained tranche-C UI/export/runtime fixes |
| `6de8a257` keybinding preservation | audit | no-op | local `EditorKeybindingsManager` never had the upstream claimant-based default-eviction path |
| provider payload hook / dynamic tool registration / `promptGuidelines` / `session_directory` | defer | skipped for now | extension-surface growth out of scope |
| export/share parity beyond existing local foundation | defer | skipped for now | local fork already has JSONL download/share groundwork; no bounded low-risk delta was selected |
| wider workflow churn (`1M` context handling, retry/replay follow-ons, package-startup behavior, child-agent invocation reuse) | defer | skipped for now | either already partially present locally or wide enough to deserve a dedicated follow-up branch |
| net-new providers including `OpenCode Go` | defer | skipped | preserve minimized provider surface |
| `multi-edit`, runtime host/session switching, hidden-thinking label API, `defineTool`, `prepareArguments`, post-`v0.62.0` churn | hard defer | skipped | outside approved window/scope |

### Path Mapping Decisions

- Upstream root `pi-test.sh` maps to local `scripts/pi-test.sh`.
- Upstream `packages/coding-agent/src/**` paths continue to map directly to the fork's runtime files when they still exist locally.
- Upstream additions targeting removed docs/examples/tests trees remain out of scope even in this aggressive pass.

### Integration Batches

#### Tranche A

- Target window: `v0.55.0..v0.57.1`
- Included areas:
  - `branchSummary.skipPrompt`
  - `treeFilterMode`
  - `--fork`
  - custom session IDs
  - portable `scripts/pi-test.sh`
- Files touched:
  - `packages/coding-agent/src/core/settings-manager.ts`
  - `packages/coding-agent/src/modes/interactive/components/settings-selector.ts`
  - `packages/coding-agent/src/modes/interactive/components/tree-selector.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/src/cli/args.ts`
  - `packages/coding-agent/src/main.ts`
  - `packages/coding-agent/src/core/session-manager.ts`
  - `scripts/pi-test.sh`
- Outcome: successful

#### Tranche B

- Target window: `v0.57.1..v0.60.0`
- Included areas:
  - auth/settings lock retries
  - explicit CLI extension precedence
  - keep `~/.agents/skills` user-scoped
  - tmux keyboard setup warning
  - full redraw on terminal height changes
  - digit/`modifyOtherKeys` parsing improvements
  - slash-command autocomplete selection chaining and better exact/prefix selection
- Files touched:
  - `packages/coding-agent/src/core/auth-storage.ts`
  - `packages/coding-agent/src/core/settings-manager.ts`
  - `packages/coding-agent/src/core/resource-loader.ts`
  - `packages/coding-agent/src/core/package-manager.ts`
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/tui/src/tui.ts`
  - `packages/tui/src/keys.ts`
  - `packages/tui/src/components/editor.ts`
- Outcome: successful

#### Tranche C

- Target window: `v0.60.0..v0.62.0`
- Included areas:
  - configurable select-list layout
  - stale scrollback clear ordering on full redraw
  - safe auto-resized image limits for CLI/file reads
- Files touched:
  - `packages/tui/src/components/select-list.ts`
  - `packages/tui/src/index.ts`
  - `packages/tui/src/components/editor.ts`
  - `packages/coding-agent/src/modes/interactive/components/settings-selector.ts`
  - `packages/coding-agent/src/modes/interactive/components/show-images-selector.ts`
  - `packages/coding-agent/src/modes/interactive/components/theme-selector.ts`
  - `packages/coding-agent/src/modes/interactive/components/thinking-selector.ts`
  - `packages/tui/src/tui.ts`
  - `packages/coding-agent/src/cli/file-processor.ts`
  - `packages/coding-agent/src/core/tools/read.ts`
  - `packages/coding-agent/src/utils/image-resize.ts`
- Outcome: successful

#### Audit Notes

- `6de8a257` (`stop evicting unrelated default keybindings`) was inspected but not ported because the fork's simplified `packages/tui/src/keybindings.ts` does not implement the upstream claimant-resolution path that caused the bug.

### Verification Results

- Tranche A gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `bash /Users/edouard/Developer/Organelle/pi/scripts/pi-test.sh --version` from a fresh temp directory: passed (`0.52.12`)
  - temp-dir `.pi/` creation check: passed (`False`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- Tranche B gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
- Tranche C gate:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
  - `./scripts/rebuild-local-pi.sh`: passed
  - `pi --version`: passed (`0.52.12`)
  - linked `pi` target: `/Users/edouard/Developer/Organelle/pi/packages/coding-agent/dist/cli.js`
  - `git diff --check`: passed
- Interactive tmux smoke: passed
  - temp project settings forced `treeFilterMode: "user-only"` and `branchSummary.skipPrompt: true`
  - `/tree` footer rendered `(1/1) [user]`
  - selecting a different point navigated directly back without ever showing `Summarize branch?`
  - tmux startup warning rendered correctly when `extended-keys` was off
- `--fork` smoke: passed
  - `pi --fork <session> -p ...` under isolated `PI_CODING_AGENT_DIR` exited with the expected no-model error under `--no-env`
  - despite the model failure, the CLI/session path created a forked JSONL session in the target temp project
  - new session header had the temp target cwd and `parentSession` pointing at the source session file

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| extension-surface additions in `v0.55.0..v0.62.0` | widen runtime/API surface more than this fork wants | only revisit if a selected runtime feature proves to require them |
| export/share parity beyond current local foundation | no obvious bounded delta after auditing existing JSONL/share/download scaffolding | revisit in a dedicated export/share pass if a concrete behavior gap is found |
| wider workflow churn (`1M` context handling, startup package-update behavior, replay/retry follow-ons, child-agent invocation reuse) | partly present locally already (`sessionDir`, piped stdin, model reload/share groundwork) and otherwise too behaviorally wide for this branch | revisit in a narrower workflow-focused pass |
| net-new provider families | breaks minimized provider surface goal | revisit in a provider-specific sync pass |
| all post-`v0.62.0` architecture/features | outside approved window | next aggressive pass if needed |

### Final Summary

- What was imported:
  - persisted `branchSummary.skipPrompt` and `treeFilterMode`, including settings UI wiring and `/tree` default-filter behavior
  - CLI/session workflow upgrades: `--fork`, partial session lookup, and custom session IDs
  - portable local launcher behavior in `scripts/pi-test.sh`
  - auth/settings lock retries, explicit CLI extension precedence, and safer user-scoped `.agents` discovery
  - interactive stability fixes: tmux keyboard warnings, height-triggered full redraws, stronger key parsing, and better slash-command autocomplete behavior
  - configurable select-list layout, stale scrollback clearing, and safe image omission when resize limits cannot be met
- What was intentionally skipped:
  - extension/runtime surface expansion (`provider payload hook`, dynamic tool registration, `promptGuidelines`, `session_directory`)
  - net-new provider families
  - wider workflow/export parity work where the fork already has partial foundation or the upstream delta was not bounded enough for this branch
  - all post-`v0.62.0` architecture churn
- Risk notes:
  - medium, but acceptable for an aggressive pass: the surface area is much larger than tranche 1, yet every gate passed, rebuilds remained clean, the linked `pi` binary still points at this checkout, and both the tmux tree flow and isolated `--fork` smoke behaved as intended
- Follow-up tasks:
  - land this branch, then decide whether a dedicated `r3` should target export/share parity and narrower workflow/session behavior
  - keep treating major extension-surface or provider-surface growth as separate passes, not incidental catch-up

---

## Sync Cycle: 2026-04-01

### Metadata

- Sync branch: `sync/upstream-20260401-r1`
- Operator: `codex-gpt-5`
- Started at: `2026-04-01`
- Completed at: `2026-04-01`
- Base branch/commit: `main @ c579acc8`
- Upstream window:
  - from: `3a3e37d3` (last synced, `upstream/main` on 2026-02-22)
  - to: `v0.55.0`

### Preflight Snapshot

- `git status --short` summary: untracked `.codex/` and `scripts/rebuild-local-pi.sh` in working tree before branching; kept intentionally out of scope for this sync branch.
- Notable local divergence notes: intentional fork minimization remains in effect; no local tests/examples/docs should be reintroduced as part of this runtime-only tranche.

### Commit Triage

| Commit | Area | Classification | Decision | Notes |
| --- | --- | --- | --- | --- |
| `8386a807` | tui binary/koffi build | defer | skipped | build-script focused; not part of minimized runtime sync |
| `19c6f641` | ai generated models | defer | skipped | generated churn without targeted runtime need |
| `5563d896` | Release v0.54.1 | defer | skipped | version bumps/release wrapper |
| `de1560a7` | [Unreleased] section | defer | skipped | changelog housekeeping only |
| `7364696a` | model resolver | manual | applied | runtime file exists locally; tests omitted |
| `21141e00` | docs built-in tool renderer example | defer | skipped | examples/docs only |
| `316c2afe` | git-update test fix | defer | skipped | tests only |
| `d34e8d80` | extensions README | defer | skipped | docs only |
| `34f841f0` | OSS vacation README | defer | skipped | docs only |
| `6137de9c` | extension theme/session sync | manual | applied | runtime file exists locally; tests omitted |
| `f1a2092b` | settings manager `.pi` creation | manual | applied | runtime file exists locally; tests omitted |
| `9e694f08` | changelog entry | defer | skipped | changelog only |
| `0c61dd58` | write tool incremental highlight | manual | applied | runtime file exists locally; changelog omitted |
| `2417fc25` | Release v0.54.2 | defer | skipped | version bumps/release wrapper |
| `380236a0` | [Unreleased] section | defer | skipped | changelog housekeeping only |
| `f0379384` | project-over-global resources | defer | skipped | behaviorally wide; out of scope for conservative first tranche |
| `d3232c2e` | Release v0.55.0 | defer | skipped | version bumps/release wrapper |

### Path Mapping Decisions

- Upstream paths `packages/coding-agent/src/core/model-resolver.ts`, `src/core/settings-manager.ts`, `src/modes/interactive/interactive-mode.ts`, and `src/modes/interactive/components/tool-execution.ts` map directly to existing fork paths; these were ported manually without cherry-picking tests/examples/docs.
- Upstream tests under `packages/coding-agent/test/**` were not reintroduced; this fork does not currently carry the relevant local test files.
- Upstream example/docs paths under `packages/coding-agent/examples/**`, `packages/coding-agent/README.md`, and changelog/package-release files were intentionally skipped to preserve minimization.

### Integration Batches

#### Batch 1

- Included commits: `7364696a`
- Integration mode: manual port
- Files touched: `packages/coding-agent/src/core/model-resolver.ts`
- Outcome: successful

#### Batch 2

- Included commits: `f1a2092b`
- Integration mode: manual port
- Files touched: `packages/coding-agent/src/core/settings-manager.ts`
- Outcome: successful

#### Batch 3

- Included commits: `6137de9c`, `0c61dd58`
- Integration mode: manual port
- Files touched:
  - `packages/coding-agent/src/modes/interactive/interactive-mode.ts`
  - `packages/coding-agent/src/modes/interactive/components/tool-execution.ts`
- Outcome: successful

### Verification Results

- Batch 1:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- Batch 2:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- Batch 3:
  - `npm run check`: passed
  - `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- Interactive tmux smoke: passed
  - prompted pi to write `/tmp/pi-sync-smoke-write.txt`
  - observed live `write` tool rendering in the captured pane
  - verified file contents were exactly `alpha`, `beta`, `gamma`
- Empty `.pi` creation smoke: passed
  - from a fresh temp directory, `bash /Users/edouard/Developer/Organelle/pi/scripts/pi-test.sh --version` returned `0.52.12`
  - no `.pi/` directory was created in that temp directory
- `npm run build`: not run by policy for this workstream

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `f0379384` project-over-global resources | wide behavioral/resource-loading change; too large for conservative runtime-only tranche | revisit in a dedicated follow-up tranche if resource precedence becomes a concrete problem |
| `8386a807` koffi/binary build adjustments | binary/build-script focused rather than core runtime | revisit only if Bun/binary packaging issues become relevant |
| `19c6f641` generated models | generated catalog churn without immediate value | revisit when doing a targeted provider/model refresh |
| All release/changelog/docs/example/package-version changes in `3a3e37d3..v0.55.0` | no runtime value for this minimized fork | optional docs/release-only pass, otherwise skip indefinitely |

### Final Summary

- What was imported: safer CLI provider/model resolution; settings storage no longer creates empty `.pi` directories unless writing; interactive theme changes persist to session settings; write-tool preview highlighting updates incrementally during partial streaming.
- What was intentionally skipped: resource-precedence feature work, build/binary adjustments, generated models, release wrappers, changelogs, docs, examples, and package-version churn.
- Risk notes: low/medium; all imported changes were runtime-facing but narrow, passed type-check and version gates after each batch, and passed both targeted smoke checks.
- Follow-up tasks:
  - start the next bounded window at `v0.55.0..v0.56.0`
  - continue using the same conservative runtime-only filter unless a specific upstream feature is explicitly requested

---

## Sync Cycle: 2026-02-22

### Metadata

- Sync branch: `sync/upstream-20260221`
- Operator: `claude-sonnet-4-6`
- Started at: `2026-02-22`
- Completed at: `2026-02-22`
- Base branch/commit: `main @ ba750581`
- Upstream window:
  - from: `0a6b0b8f` (last synced)
  - to: `3a3e37d3` (`upstream/main`, covers v0.53.0, v0.53.1, v0.54.0)

### Preflight Snapshot

- `git status --short` summary: 2 modified files (update banner fix + models regen), 1 untracked dir (`.claude/`) — committed to main before branching.
- Notable local divergence notes: intentional fork simplifications, no docs/tests/examples directories.

### Commit Triage

| Commit | Area | Classification | Decision | Notes |
| --- | --- | --- | --- | --- |
| `5133697b` | README vacation docs | defer | skipped | docs only |
| `312af81e` | ai CHANGELOG | defer | skipped | changelog only |
| `6e4680d1` | coding-agent CHANGELOG | defer | skipped | changelog only |
| `b9a2b6cc` | coding-agent CHANGELOG | defer | skipped | changelog only |
| `7207c16c` | coding-agent CHANGELOG | defer | skipped | changelog only |
| `ce1410b0` | Release v0.53.0 | defer | skipped | version bumps |
| `4ba3e5be` | [Unreleased] section | defer | skipped | housekeeping |
| `18ea1ed9` | Release v0.53.1 | defer | skipped | version bumps |
| `5706e66a` | [Unreleased] section | defer | skipped | housekeeping |
| `76b02a81` | Release v0.54.0 | defer | skipped | version bumps |
| `3a3e37d3` | [Unreleased] section | defer | skipped | housekeeping |
| `65a3b287` | merge wrapper (auth storage) | defer | skipped | non-actionable wrapper |
| `0a6b0b8f` | merge wrapper (settings) | defer | skipped | non-actionable wrapper |
| `0245b524` | feat(ai): Sonnet 4.6 fallback | manual | applied | cherry-pick conflicted; ported manually using `ensureModel` pattern |
| `18c7ab8a` | chore(models): Gemini catalog | defer | skipped | references `ANTIGRAVITY_ENDPOINT`/`VERTEX_BASE_URL` not present in fork |
| `2977c149` | refactor: auth storage backend | manual | applied | runtime files only; skipped tests/examples/docs/mom package |
| `39cbf47e` | feat: .agents skill discovery | direct (partial) | applied | cherry-pick applied cleanly to package-manager.ts; conflict-deleted upstream docs/tests/CHANGELOG |

### Path Mapping Decisions

- `packages/coding-agent/docs/sdk.md`, `docs/skills.md` — upstream-introduced by `39cbf47e`, removed (fork has no docs dir).
- `packages/coding-agent/test/package-manager.test.ts` — upstream-introduced by `39cbf47e`, removed (fork has no tests).
- `packages/mom/src/agent.ts` — touched by `2977c149`, skipped (fork doesn't include `mom` package).

### Integration Batches

#### Batch 1

- Included commits: `0245b524` (manual port)
- Integration mode: manual port (used `ensureModel` pattern instead of upstream's `allModels.push`)
- Files touched: `packages/ai/scripts/generate-models.ts`
- Outcome: successful

#### Batch 2

- Included commits: `2977c149` (manual port, runtime files only)
- Integration mode: manual port
- Files touched: `packages/coding-agent/src/core/auth-storage.ts`, `src/core/sdk.ts`, `src/index.ts`, `src/main.ts`
- Outcome: successful

#### Batch 3

- Included commits: `39cbf47e` (cherry-pick with conflict resolution)
- Integration mode: cherry-pick; conflict files removed (docs/tests/CHANGELOG not in fork)
- Files touched: `packages/coding-agent/src/core/package-manager.ts`
- Outcome: successful

### Verification Results

- `npm run check`: **passed**
- `./scripts/pi-test.sh --version`: **passed** (`0.52.12`)
- `npm run build`: **passed**
- `dist/cli.js --version`: **passed** (`0.52.12`)

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `18c7ab8a` Gemini/Antigravity catalog | References provider infrastructure not in this fork | Only if Google/Vertex providers are added |
| All release/changelog/docs commits | No runtime value for single-user fork | N/A |

### Final Summary

- What was imported: Sonnet 4.6 model fallback; auth storage backend abstraction; `.agents` path skill discovery.
- What was intentionally skipped: Gemini/Antigravity catalog (missing provider infra), all changelog/release/docs commits, mom package changes, tests/examples.
- Risk notes: low — all three batches passed type check, version smoke test, and full build.
- Follow-up tasks: none outstanding.

---

## Sync Cycle: YYYY-MM-DD

### Metadata

- Sync branch: `sync/upstream-YYYYMMDD`
- Operator:
- Started at:
- Completed at:
- Base branch/commit:
- Upstream window:
  - from:
  - to:

### Preflight Snapshot

- `git status --short` summary:
- Notable local divergence notes:

### Commit Triage

| Commit | Area | Classification | Decision | Notes |
| --- | --- | --- | --- | --- |
| `<sha>` | `packages/ai/...` | direct/manual/defer | applied/skipped | rationale |

### Path Mapping Decisions

- Upstream path:
- Local mapped path:
- Rationale:

### Integration Batches

#### Batch 1

- Included commits:
- Integration mode: direct cherry-pick / manual port
- Files touched:
- Outcome:

#### Batch N

- Included commits:
- Integration mode: direct cherry-pick / manual port
- Files touched:
- Outcome:

### Verification Results

For each completed batch:

```bash
npm run check
./scripts/pi-test.sh --version
```

Optional:

```bash
npm run build
node ./packages/coding-agent/dist/cli.js --version
```

Record:

- `npm run check`:
- `./scripts/pi-test.sh --version`:
- `npm run build` (if run):
- `dist/cli.js --version` (if run):

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `<sha>` | conflicts with fork invariant | revisit on next release |

### Final Summary

- What was imported:
- What was intentionally skipped:
- Risk notes:
- Follow-up tasks:

---

## Sync Cycle: 2026-02-14 (dry-run)

### Metadata

- Sync branch: `N/A (dry-run only in current workspace)`
- Operator: `cursor-assistant`
- Started at: `2026-02-14`
- Completed at: `2026-02-14`
- Base branch/commit: `main @ 00e46f54`
- Upstream window:
  - from: `9e22d391` (merge-base with upstream/main)
  - to: `0a6b0b8f` (`upstream/main`)

### Preflight Snapshot

- `git status --short` summary: ~`504` changed paths in working tree.
- Notable local divergence notes:
  - large intentional fork simplification (many deleted upstream paths/packages)
  - merged runtime topology (`packages/agent/src/**` -> `packages/coding-agent/src/core/agent-core/**`)
  - moved root scripts to `scripts/`

### Commit Triage

| Commit | Area | Classification | Decision | Notes |
| --- | --- | --- | --- | --- |
| `5133697b` | `README.md`, `packages/coding-agent/README.md` | defer | skipped | OSS vacation messaging/docs only; low-value for fork runtime |
| `de2736ba` | coding-agent settings refactor | manual | queued | code files exist (`src/core/settings-manager.ts`, `src/main.ts`) but docs/tests touched upstream are removed locally |
| `0a6b0b8f` | merge wrapper commit | defer | skipped | umbrella merge commit; use constituent commit triage instead |

### Path Mapping Decisions

- Upstream path: `packages/agent/src/**`
- Local mapped path: `packages/coding-agent/src/core/agent-core/**`
- Rationale: fork architecture co-locates agent runtime inside coding-agent.

- Upstream path: `pi-test.sh`, `test.sh`
- Local mapped path: `scripts/pi-test.sh`, `scripts/test.sh`
- Rationale: fork moved root scripts under `scripts/`.

- Upstream path: extension imports of `@mariozechner/pi-agent-core`
- Local mapped path: resolved via `packages/coding-agent/src/core/extensions/loader.ts`
- Rationale: preserve compatibility for legacy extension imports.

### Integration Batches

#### Batch 1 (proposed)

- Included commits: `de2736ba` (partial manual-port only)
- Integration mode: manual port
- Files touched (proposed): `packages/coding-agent/src/core/settings-manager.ts`, `packages/coding-agent/src/main.ts`
- Outcome: not applied in this dry-run cycle

### Verification Results

- `npm run check`: not run in this dry-run cycle
- `./scripts/pi-test.sh --version`: not run in this dry-run cycle
- `npm run build` (if run): not run
- `dist/cli.js --version` (if run): not run

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `5133697b` docs/vacation updates | low relevance to fork runtime | optional on next docs refresh |
| `0a6b0b8f` merge wrapper | non-actionable without constituent commit handling | revisit only if cherry-pick strategy changes |

### Final Summary

- What was imported: nothing (dry-run only).
- What was intentionally skipped: upstream docs-only vacation commit and merge wrapper commit.
- Risk notes: applying `de2736ba` will require selective/manual port because this fork removed docs/tests directories touched upstream.
- Follow-up tasks:
  - run a real integration batch for `de2736ba` (manual port of code files only)
  - run verification gate immediately after that batch

---

## Sync Cycle: 2026-02-14 (batch1 real run)

### Metadata

- Sync branch: `sync/upstream-20260214-batch1`
- Operator: `cursor-assistant`
- Started at: `2026-02-14`
- Completed at: `2026-02-14`
- Base branch/commit: `main @ 00e46f54`
- Upstream window:
  - from: `9e22d391` (merge-base with upstream/main)
  - to: `0a6b0b8f` (`upstream/main`)

### Preflight Snapshot

- `git status --short` summary: large pre-existing divergence remained in branch (expected for this fork).
- Notable local divergence notes:
  - intentional simplification/deletions across repo
  - merged runtime topology and script relocation invariants in effect

### Commit Triage

| Commit | Area | Classification | Decision | Notes |
| --- | --- | --- | --- | --- |
| `5133697b` | `README.md`, `packages/coding-agent/README.md` | defer | skipped | docs/vacation messaging only |
| `de2736ba` | coding-agent settings refactor | manual | applied (partial) | applied runtime file changes only |
| `0a6b0b8f` | merge wrapper commit | defer | skipped | wrapper merge commit, no direct actionable delta |

### Path Mapping Decisions

- Upstream path: `packages/coding-agent/src/core/settings-manager.ts`
- Local mapped path: `packages/coding-agent/src/core/settings-manager.ts`
- Rationale: path exists unchanged in fork; safe direct import from upstream commit.

- Upstream path: `packages/coding-agent/src/main.ts`
- Local mapped path: `packages/coding-agent/src/main.ts`
- Rationale: path exists unchanged in fork; safe direct import from upstream commit.

- Upstream paths skipped for this commit: docs/tests/examples
- Local mapping decision: not reintroduced in this fork.
- Rationale: these directories were intentionally removed and are out-of-scope for runtime sync.

### Integration Batches

#### Batch 1

- Included commits: `de2736ba` (runtime subset only)
- Integration mode: manual port (direct file-level import for two runtime files)
- Files touched:
  - `packages/coding-agent/src/core/settings-manager.ts`
  - `packages/coding-agent/src/main.ts`
- Outcome: successful
- Batch diff summary: `273 insertions`, `143 deletions` across `2 files`

### Verification Results

- `npm run check`: passed
- `./scripts/pi-test.sh --version`: passed (`0.52.12`)
- `npm run build` (if run): not run in this batch
- `dist/cli.js --version` (if run): not run in this batch

### Deferred Items

| Commit/Area | Why deferred | Follow-up trigger |
| --- | --- | --- |
| `5133697b` docs/vacation updates | low runtime value for this fork | optional docs refresh cycle |
| `0a6b0b8f` merge wrapper | merge wrapper only; constituent commits already triaged | only if merge strategy changes |

### Final Summary

- What was imported: upstream settings storage/error-handling refactor for runtime files (`settings-manager.ts`, `main.ts`).
- What was intentionally skipped: upstream docs/examples/tests changes and wrapper merge commit.
- Risk notes: low/medium; change is runtime-affecting but verification gate passed.
- Follow-up tasks:
  - evaluate whether to import `5133697b` docs changes in a docs-only cycle
  - choose next bounded upstream window for Batch 2
