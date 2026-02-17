# Upstream Sync Playbook

This playbook defines a repeatable, low-risk process to pull updates from upstream (`badlogic/pi-mono`) into this customized fork without overwriting local architecture changes.

## Scope and goals

- Keep this fork aligned with valuable upstream improvements.
- Preserve fork-specific structure and intentional deletions.
- Avoid destructive git workflows.
- Make each sync cycle auditable and reversible.

## Fork-specific invariants (must remain true)

Treat these as contract rules during every sync:

1. Upstream `packages/agent/src/**` maps to local `packages/coding-agent/src/core/agent-core/**`.
2. Upstream root scripts `pi-test.sh` and `test.sh` map to local `scripts/pi-test.sh` and `scripts/test.sh`.
3. Backward compatibility for legacy extension imports is maintained through `packages/coding-agent/src/core/extensions/loader.ts`.
4. This fork intentionally excludes several upstream packages/directories; do not reintroduce them unless explicitly requested.

## Hard safety rules

Never use the following during sync work:

- `git reset --hard`
- `git checkout .`
- `git clean -fd`
- `git stash`
- force-push (`git push --force` / `--force-with-lease`) on shared branches

Always:

- Work in a dedicated sync branch.
- Keep batches small and independently verifiable.
- Record every decision in the sync log.

## Recommended cadence

- Primary: once per upstream release tag.
- Secondary: ad-hoc for critical fixes (security, provider breakages, high-impact regressions).
- Limit each cycle to a bounded window (single release or narrow commit range).

## Sync cycle workflow

### Phase 0: preflight

1. Ensure remotes are configured.
2. Capture baseline repo state.
3. Create a dedicated sync branch from current `main`.

Command recipe:

```bash
git remote -v
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
git checkout -b sync/upstream-YYYYMMDD
```

### Phase 1: fetch and bound the upstream window

Fetch upstream refs/tags and choose a bounded integration window.

Command recipe:

```bash
git fetch upstream --tags
git branch -r | rg upstream
git log --oneline --decorate -n 30 upstream/main
```

Choose one of:

- Release-based: `FROM_TAG..TO_TAG`
- Commit-based: `FROM_SHA..upstream/main`
- Date-based: commits since last sync date

### Phase 2: build the change inventory

Generate a file-level change list before touching code.

Command recipe:

```bash
git diff --name-status FROM_REF..TO_REF
git log --oneline FROM_REF..TO_REF -- packages/ai packages/coding-agent packages/tui packages/agent
```

Then classify commits into:

- **Direct apply**: paths map cleanly to existing fork paths.
- **Manual port**: touches upstream `packages/agent/**` or moved/deleted fork paths.
- **Defer/ignore**: irrelevant packages or intentionally excluded areas.

### Phase 3: path mapping and translation

Use this mapping table when reading upstream diffs:

| Upstream path | Local path | Integration mode |
| --- | --- | --- |
| `packages/agent/src/agent.ts` | `packages/coding-agent/src/core/agent-core/agent.ts` | Manual port/cherry-pick with conflict resolution |
| `packages/agent/src/agent-loop.ts` | `packages/coding-agent/src/core/agent-core/agent-loop.ts` | Manual port/cherry-pick with conflict resolution |
| `packages/agent/src/proxy.ts` | `packages/coding-agent/src/core/agent-core/proxy.ts` | Manual port/cherry-pick with conflict resolution |
| `packages/agent/src/types.ts` | `packages/coding-agent/src/core/agent-core/types.ts` | Manual port/cherry-pick with conflict resolution |
| `pi-test.sh` | `scripts/pi-test.sh` | Manual port (script path adaptation) |
| `test.sh` | `scripts/test.sh` | Manual port (script path adaptation) |
| Legacy extension import behavior | `packages/coding-agent/src/core/extensions/loader.ts` | Keep compatibility shim intact unless intentionally changed |

### Phase 4: controlled integration in small batches

Process one small commit group at a time.

#### 4A) Direct-apply commits

Command recipe:

```bash
git cherry-pick -x <commit-sha>
```

If conflict appears in mapped paths, stop and switch to manual port flow.

#### 4B) Manual-port commits (mapped or structurally divergent)

Command recipe:

```bash
git show <commit-sha> -- packages/agent/src
git show <commit-sha> -- packages/coding-agent/src packages/ai/src packages/tui/src
```

Apply equivalent edits manually to local mapped destinations.

For script updates from upstream root:

- port logic to `scripts/pi-test.sh` or `scripts/test.sh`
- keep execute bits (`chmod +x scripts/pi-test.sh scripts/test.sh`)

### Phase 5: verification gate (required per batch)

Run verification after each batch before continuing:

```bash
npm run check
./scripts/pi-test.sh --version
```

Optional build artifact smoke:

```bash
npm run build
node ./packages/coding-agent/dist/cli.js --version
```

If failures occur:

1. Fix in current branch.
2. Re-run full verification gate.
3. Do not proceed to next batch until green.

### Phase 6: document decisions

For each processed commit group, log:

- source commit range
- category (direct apply/manual port/deferred)
- affected paths
- rationale for any skip
- verification outcome

Use `docs/upstream-sync-log.md`.

### Phase 7: finalize sync cycle

When all selected batches pass verification:

```bash
git status
git log --oneline --decorate -n 30
```

Open PR from sync branch to your fork `main` with:

- Included upstream window
- Mapping decisions
- Deferred items
- Verification output summary

## Hotspot files (expect recurring conflicts)

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `README.md`
- `CLAUDE.md`
- `AGENTS.md`
- `packages/coding-agent/src/core/extensions/loader.ts`

## What to ignore by default

Unless explicitly requested, skip upstream changes that only affect:

- packages intentionally removed from this fork
- CI/workflow areas that this fork intentionally does not use
- docs/examples for removed packages

## Escalation rules

Escalate for explicit review before integrating if:

- upstream introduces new cross-package architectural changes
- a change requires reversing fork invariants
- dependency graph changes impact build/runtime assumptions

