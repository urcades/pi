# Upstream Sync Operator

Use this skill when updating this fork from upstream (`badlogic/pi-mono`) while preserving fork-specific architecture changes.

## Use this skill when

- User asks to pull/sync/incorporate upstream changes.
- User asks to backport a release or commit range from upstream.
- User asks to evaluate whether upstream changes are safe to import.

## Do not use this skill when

- User asks for a normal feature implementation unrelated to upstream sync.
- User asks for a full destructive reset to upstream state.

## Safety rules (mandatory)

1. Never use destructive commands:
   - `git reset --hard`
   - `git checkout .`
   - `git clean -fd`
   - `git stash`
2. Never sync directly on long-lived working branches.
3. Always use a dedicated sync branch.
4. Keep integration batches small and independently verifiable.
5. Preserve fork invariants:
   - `packages/agent/src/**` maps to `packages/coding-agent/src/core/agent-core/**`
   - `pi-test.sh` and `test.sh` map to `scripts/pi-test.sh` and `scripts/test.sh`
   - legacy extension import compatibility remains in `packages/coding-agent/src/core/extensions/loader.ts`

## Required references

- Playbook: `docs/upstream-sync-playbook.md`
- Sync log template: `docs/upstream-sync-log.md`

## Procedure

### Step 1: preflight

Run:

```bash
git remote -v
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
git checkout -b sync/upstream-YYYYMMDD
```

Record baseline in sync log.

### Step 2: fetch upstream and bound window

Run:

```bash
git fetch upstream --tags
git log --oneline --decorate -n 30 upstream/main
```

Pick one bounded window:

- release tag range, or
- commit range, or
- date window

### Step 3: inventory and classify

Run:

```bash
git diff --name-status FROM_REF..TO_REF
git log --oneline FROM_REF..TO_REF -- packages/ai packages/coding-agent packages/tui packages/agent
```

Classify each candidate commit:

- Direct apply
- Manual port (especially upstream `packages/agent/**`)
- Defer/ignore

Log each decision.

### Step 4: integrate in small batches

Direct apply:

```bash
git cherry-pick -x <sha>
```

Manual port:

```bash
git show <sha> -- packages/agent/src
git show <sha> -- packages/coding-agent/src packages/ai/src packages/tui/src
```

Apply equivalent changes to mapped local paths.

### Step 5: verification gate (after every batch)

Run:

```bash
npm run check
./scripts/pi-test.sh --version
```

Optional artifact check:

```bash
npm run build
node ./packages/coding-agent/dist/cli.js --version
```

If verification fails, fix and re-run before next batch.

### Step 6: finalize

Before opening PR, ensure sync log includes:

- upstream window
- included commits
- deferred commits + rationale
- mapping decisions
- verification outcomes

## Expected output from assistant each cycle

1. Upstream window selected.
2. Commit classification table (direct/manual/deferred).
3. Applied batch summary.
4. Verification results.
5. Updated sync log entry.

