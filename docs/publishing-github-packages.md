# Publishing to GitHub Packages (Option B)

> Status: implemented publish path · Scope decision documented · First publish may require operator PAT with `write:packages`

## Decision (required reading)

GitHub Packages for npm **requires the package scope to match the GitHub owner** (user or organization). See [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

| Fact | Value |
|------|--------|
| GitHub owner of this repo | **user** `omrecords82` (not an organization) |
| Source package names (brand) | `@om/contracts`, `@om/tokens`, `@om/ui` |
| GitHub Packages publish names | `@omrecords82/contracts`, `@omrecords82/tokens`, `@omrecords82/ui` |
| Registry URL | `https://npm.pkg.github.com` |

### Why not publish as `@om/*`?

- Requesting `@om/ui` from GitHub Packages resolves under owner **`om`**.
- There is **no** GitHub organization named `om` under our control.
- A public GitHub **user** named `Om` already exists, so creating an `om` org is not available.
- Publishing `@om/*` from `omrecords82` to GitHub Packages is **not supported** and must not be attempted silently.

### Options considered

| Option | Viable? | Notes |
|--------|---------|--------|
| A. Keep `@om/*` on GitHub Packages under `omrecords82` | **No** | Scope must equal owner |
| B. Create/use GitHub org `om` | **No** | Name blocked by existing user `Om` |
| C. Rename source packages permanently to `@omrecords82/*` | Yes | Large rename; loses `@om` brand in `package.json` |
| D. **Publish as `@omrecords82/*`, keep `@om/*` in source** (chosen) | **Yes** | Publish script remaps names; consumers use npm aliases |
| E. External registry (npmjs private / Verdaccio) with `@om` | Yes, but not Option B | Separate decision |

**Chosen for Option B:** one GitHub Packages registry under `omrecords82`, published names `@omrecords82/*`, source brand remains `@om/*`, apps install via npm aliases so import paths stay `@om/...`.

## Packages

| Source name | Published name | Version (bootstrap) |
|-------------|----------------|---------------------|
| `@om/contracts` | `@omrecords82/contracts` | `0.1.0` |
| `@om/tokens` | `@omrecords82/tokens` | `0.1.0` |
| `@om/ui` | `@omrecords82/ui` | `0.1.0` |

Dependency order: contracts → tokens → ui.

## Auth (never commit secrets)

### Local / operator PAT

Create a **classic** Personal Access Token with at least:

- `write:packages`
- `read:packages`
- `repo` (needed to link packages to this repository)

```sh
export NODE_AUTH_TOKEN=<classic-pat-with-write:packages>
```

Fine-grained tokens often lack Packages permissions; if `gh api /user/packages` returns 403, the token cannot publish or list packages.

### CI

Recommended workflow YAML lives in-repo at [`docs/ci/publish-github-packages.yml`](ci/publish-github-packages.yml) (kept outside `.github/workflows/` until a token with the `workflow` scope can install it).

To enable CI publish:

1. Copy `docs/ci/publish-github-packages.yml` → `.github/workflows/publish.yml` (requires a PAT/`gh` token with **`workflow`** scope to push).
2. Add repository secret **`NODE_AUTH_TOKEN`** (classic PAT with `write:packages` + `read:packages` + `repo`).
3. Tag `v0.1.0` (or use workflow_dispatch).

Until the workflow file is installed under `.github/workflows/`, use the manual publish command below.

## Manual publish (one command after auth)

```sh
corepack enable
corepack prepare pnpm@11.10.0 --activate
pnpm install --frozen-lockfile

# Dry run (no token required for pack dry-run staging):
node scripts/publish-github-packages.mjs --dry-run

# Real publish:
export NODE_AUTH_TOKEN=<pat>
node scripts/publish-github-packages.mjs
# optional dist-tag:
node scripts/publish-github-packages.mjs --tag next
```

Dist-tags: default `latest`. Use `next` or `dev` for pre-releases. **Production apps must pin exact versions**, not floating tags.

## CI publish (tags)

Push an annotated or lightweight version tag:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Workflow `Publish GitHub Packages` builds, validates, and runs the publish script when `NODE_AUTH_TOKEN` is configured.

## Consumer install (OM / OMAI / Studio / Workshop)

### 1. `.npmrc` (no secrets committed)

```ini
@omrecords82:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` in the environment (or CI secret) to a PAT with `read:packages`.

### 2. `package.json` — pin exact versions; keep `@om/*` imports via aliases

```json
{
  "dependencies": {
    "@om/contracts": "npm:@omrecords82/contracts@0.1.0",
    "@om/tokens": "npm:@omrecords82/tokens@0.1.0",
    "@om/ui": "npm:@omrecords82/ui@0.1.0"
  }
}
```

Alternatively depend directly on `@omrecords82/*` and update import paths (not recommended while source brand is `@om`).

### 3. CSS import order

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

## Repo visibility

This GitHub repository is currently **public**. For **private** package distribution, an operator should make `omrecords82/om-packages` private (or accept public package metadata per GitHub Packages rules for public repos). Option B assumes private packages — treat repo visibility as an operator follow-up.

## What this does not do

- Does not migrate Orthodox Metrics login/menus/UI to `@om/ui`
- Does not rename source packages away from `@om/*`
- Does not invent or store PATs in git
