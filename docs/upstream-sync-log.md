# Upstream Sync Log

Use one section per sync cycle.

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

