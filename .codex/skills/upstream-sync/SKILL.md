---
name: upstream-sync
description: Safely evaluate, triage, and port bounded upstream changes from `badlogic/pi-mono` into this fork. Use when asked to sync, pull, incorporate, or backport upstream commits or release ranges, or when deciding whether an upstream window is safe to import while preserving local fork invariants.
---

# Upstream Sync

Use this skill to run a bounded upstream sync without flattening the fork.

## Start Here

Read these files before touching code:

- `../../../docs/upstream-sync-playbook.md`
- `../../../docs/upstream-sync-log.md`

Treat them as the detailed source of truth. This skill is the compact execution checklist.

## Non-Negotiables

- Never use `git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, or force-push.
- Never sync directly on `main`.
- Always use a dedicated branch named `sync/upstream-YYYYMMDD`.
- Keep batches small and independently verifiable.
- Preserve fork invariants:
  - `packages/agent/src/**` maps to `packages/coding-agent/src/core/agent-core/**`
  - `pi-test.sh` and `test.sh` map to `scripts/pi-test.sh` and `scripts/test.sh`
  - keep legacy extension import compatibility in `packages/coding-agent/src/core/extensions/loader.ts`
  - keep the upstream update banner disabled; do not reintroduce it in `interactive-mode.ts`
- Respect current repo instructions over older docs. In this repo, do not run `npm run build` unless the user explicitly asks. For local fork rebuild validation, use `./scripts/rebuild-local-pi.sh` instead.
- If a sync would require reintroducing intentionally removed packages, tests, docs, or examples, stop and ask first.

## Choose The Job Type

- Full sync: user asks to sync, pull, or bring this fork up to date with upstream.
- Safety review: user asks whether an upstream release, tag range, or commit is safe to import. Stop after inventory and triage unless asked to apply.
- Backport: user asks for a specific release or commit range. Bound the window to that exact target and ignore unrelated upstream movement.

## Workflow

### 1. Preflight

Run:

```bash
git remote -v
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
git checkout -b sync/upstream-YYYYMMDD
```

Record the baseline state in the sync log before importing anything.

### 2. Bound The Upstream Window

Run:

```bash
git fetch upstream --tags
git branch -r | rg upstream
git log --oneline --decorate -n 30 upstream/main
```

Pick exactly one bounded window:

- tag range
- commit range
- narrow date window

Avoid “sync everything since forever” windows.

### 3. Inventory And Classify

Run:

```bash
git diff --name-status FROM_REF..TO_REF
git log --oneline FROM_REF..TO_REF -- packages/ai packages/coding-agent packages/tui packages/agent
```

Classify each candidate commit:

- direct apply: paths map cleanly to files that still exist locally
- manual port: touches `packages/agent/**`, moved paths, or structurally divergent fork areas
- defer: docs-only, changelog-only, release-wrapper, intentionally removed packages, or changes that violate fork invariants

Log every decision before integrating.

### 4. Integrate In Small Batches

For direct applies:

```bash
git cherry-pick -x <sha>
```

For manual ports:

```bash
git show <sha> -- packages/agent/src
git show <sha> -- packages/coding-agent/src packages/ai/src packages/tui/src
```

Port equivalent changes into mapped local paths. If a cherry-pick conflicts in fork-only structure, switch to manual port instead of forcing it through.

### 5. Verification Gate After Every Batch

Run:

```bash
npm run check
./scripts/pi-test.sh --version
```

Do not continue until the gate is green.

### 6. Local Rebuild Gate

Before closing the sync, rebuild the locally linked CLI sequentially:

```bash
./scripts/rebuild-local-pi.sh
pi --version
```

Then confirm the active `pi` command still resolves to this repo's `packages/coding-agent/dist/cli.js`.

If `pi` is not linked to this checkout, repair it once:

```bash
cd packages/coding-agent
npm link
cd ../..
pi --version
```

Do not run `pi --version` in parallel with the rebuild. A runtime check against partially rewritten `dist` output can produce a fake broken-export error.

If the user asked for analysis only, stop before editing files and return the triage.

### 7. Finalize

Update the sync log with:

- upstream window
- commit classifications
- applied batches
- deferred items and rationale
- mapping decisions
- verification results

## Default Skip List

Unless the user explicitly asks otherwise, skip:

- release wrapper commits
- changelog-only or docs-only commits
- packages intentionally removed from this fork
- tests, examples, or docs for paths the fork intentionally does not carry
- upstream changes that depend on provider or platform plumbing absent in this fork

## Expected Response Shape

Return:

1. chosen upstream window
2. classification table
3. applied and deferred summary
4. verification results
5. sync-log update summary
