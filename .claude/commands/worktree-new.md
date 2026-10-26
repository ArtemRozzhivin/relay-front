---
description: Create a git worktree as a sibling folder (../<repo>.worktrees/<branch>), copy env files, install deps, and open it in your editor
argument-hint: <branch-name> [base-branch]
---

Create and fully set up a new git worktree. Arguments: `$ARGUMENTS`

- `$1` = branch name for the new worktree (e.g. `feat/login`). Required — if missing, ask the user.
- `$2` = base branch to branch from. Optional — if omitted, use the **current** branch (HEAD).

Worktrees live **outside** the working tree as a sibling folder, so no tool (ESLint, Vitest, Steiger, `tsc`, `next build`, IDE indexers) ever scans them.

Do this step by step, reporting what you run:

1. **Verify** you are in a git repository: `git rev-parse --is-inside-work-tree`. If not, stop and tell the user.
2. **Resolve paths:**
   - `ROOT="$(git rev-parse --show-toplevel)"`, `NAME="$(basename "$ROOT")"`, `PARENT="$(dirname "$ROOT")"`.
   - Derive a folder slug from `$1`: replace any `/` with `-` (so `feat/login` → `feat-login`).
   - Worktree path: `"$PARENT/$NAME.worktrees/<slug>"`. Create the container first: `mkdir -p "$PARENT/$NAME.worktrees"`.
   - If the target path already exists, stop and report.
3. **Create the worktree** on a new branch named exactly `$1`:
   - With a base: `git worktree add -b "$1" "$PARENT/$NAME.worktrees/<slug>" "$2"`
   - Without: `git worktree add -b "$1" "$PARENT/$NAME.worktrees/<slug>"` (branches from HEAD).
   - If the branch already exists, omit `-b` and check it out instead.
4. **Copy gitignored env files** from the repo root into the worktree if they exist: `.env`, `.env.local`, and any other real `.env.*` (skip `.env.example`, it's tracked). Use `cp`.
5. **Install dependencies** in the worktree, detecting the package manager by lockfile: `pnpm-lock.yaml` → `pnpm install`; `yarn.lock` → `yarn`; `bun.lockb` → `bun install`; else `package-lock.json`/none → `npm install`. Skip if there's no `package.json`.
6. **Open in the user's editor (optional, best-effort — never fail the command over this).** Use an editor CLI if one is on `PATH`, trying in order and stopping at the first that exists: `cursor "<absolute-worktree-path>"`, then `code "<absolute-worktree-path>"` (these CLIs work on macOS, Linux, and Windows). If neither is available, just print the absolute path and tell the user to open it manually. Do not hard-code `open`/`start`/`xdg-open` — the editor CLIs are cross-platform.
7. **Report** the final worktree path, branch name, and the base it was created from. Remind the user that `git worktree list` shows all worktrees, and that the app won't run in the new worktree until its env files (step 4) and dependencies (step 5) are in place.

Do NOT commit anything. Do NOT modify files on the base branch.
