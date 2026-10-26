# NPM Scripts Reference

## Development

```bash
npm run dev          # Start dev server with Turbopack
npm run dev:turbo    # Alternative dev command
npm run build        # Production build
npm run start        # Start production server
```

---

## Before Commit (Manual)

Run these commands before committing to ensure code quality:

```bash
npm run format       # Format source files with Prettier
npm run lint:fix     # Auto-fix ESLint issues
```

**Quick fix everything:**

```bash
npm run format && npm run lint:fix
```

**Note:** Git hooks will automatically run these on staged files, but you can run them manually anytime.

---

## Before Push (Manual Pre-checks)

Run these before pushing to catch issues early:

```bash
npm run type-check   # TypeScript type checking (recommended)
npm run test         # Run unit tests (optional but recommended)
```

**Full pre-push check:**

```bash
npm run type-check && npm run test
```

---

## Code Quality Commands

### Formatting (Prettier)

```bash
npm run format              # Format source files (.js, .ts, .tsx, json, etc.)
npm run format:all          # Format ALL files including configs
npm run format:check        # Check formatting without changes (CI/CD)
npm run format:staged       # Format staged files only (used by hooks)
```

**When to use:**

- `format` - Universal command, use anytime
- `format:all` - After merge/pull to sync formatting
- `format:check` - In CI/CD pipelines
- `format:staged` - Automatically called by git hooks

### Linting (ESLint)

```bash
npm run lint         # ESLint, including FSD import boundaries
npm run lint:fix     # Auto-fix ESLint issues
```

### FSD Architecture (Steiger)

```bash
npm run lint:fsd     # Feature-Sliced Design structural checks
```

### Scaffolding (plop)

```bash
npm run g            # Generate an FSD slice (entity/feature/widget/page/shared-ui)
```

### Type Checking (TypeScript)

```bash
npm run type-check   # Run TypeScript compiler (no emit)
npm run tsc          # Alias for type-check
```

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test             # Run all unit tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
npm run unit-test        # Run tests in watch mode
```

### E2E Tests (Cypress)

```bash
npm run cypress:open     # Open Cypress test runner (interactive)
npm run cypress:run      # Run E2E tests headless (CI)
```

---

## Maintenance

```bash
npm run clean            # Clean .next and cache
npm run clean:all        # Remove node_modules and builds
npm run reinstall        # Full cleanup + reinstall dependencies
npm run prepare-hooks    # Setup git hooks (manual)
```

---

## Git Hooks (Automatic)

### Pre-commit Hook

**Runs automatically on commit**

- `lint-staged` (Prettier + ESLint) on **staged files only** (fast!)
- `type-check` on the project

### Commit-msg Hook

**Runs automatically on commit** — enforces [Conventional Commits](https://www.conventionalcommits.org) via commitlint:

```bash
git commit -m "feat: add product entity"   # ✅
git commit -m "updated stuff"               # ❌ rejected
```

### Pre-push Hook

**Runs automatically on push** — the full quality gate:

```
format:check → lint → lint:fsd (Steiger) → type-check → test → build
```

### Skip Hooks (Use Carefully!)

```bash
git commit --no-verify -m "WIP: work in progress"
git push --no-verify
```

**⚠️ Warning:** Only skip hooks when necessary (e.g., WIP commits, hotfixes)

---

## Quick Reference Table

| Command               | When to Use                | Duration |
| --------------------- | -------------------------- | -------- |
| `npm run format`      | Before commit, anytime     | ~2-5s    |
| `npm run lint:fix`    | Before commit              | ~3-5s    |
| `npm run type-check`  | Before push                | ~10-20s  |
| `npm run test`        | Before push, after changes | ~5-15s   |
| `npm run build`       | Before deploy, CI/CD       | ~30-60s  |
| `npm run cypress:run` | Before deploy, CI/CD       | ~1-5min  |

---

## Recommended Workflows

### Daily Development

```bash
# 1. Start dev server
npm run dev

# 2. Make changes...

# 3. Before commit (optional, hooks will do this)
npm run format

# 4. Commit (hooks run automatically)
git add .
git commit -m "feat: new feature"

# 5. Before push (optional, but recommended)
npm run type-check

# 6. Push (hook runs type-check)
git push
```

### After Merge/Pull

```bash
npm install              # Update dependencies
npm run format:all       # Sync formatting across team
npm run type-check       # Ensure types are valid
```

### CI/CD Pipeline

```bash
npm ci                   # Clean install
npm run type-check       # Check types
npm run lint             # ESLint + FSD boundaries
npm run lint:fsd         # Steiger (FSD architecture)
npm run format:check     # Check formatting
npm run test             # Run unit tests
npm run build            # Build project
npm run cypress:run      # Run E2E tests
```
