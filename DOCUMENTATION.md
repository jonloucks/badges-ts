# Documentation

## Overview

`@jonloucks/badges-ts` is a CLI-first tool for generating project SVG badges and version artifacts.

Primary workflows:
- Discover package metadata from `package.json`
- Generate npm / coverage / typedoc badges
- Apply project version to generated files (`src/version.ts` and release notes)

## Installation

```bash
npm install @jonloucks/badges-ts
```

or run directly:

```bash
npx badges-ts <command>
```

## Command Reference

### `discover`

Discovers project information from `package.json` and logs name/version.

```bash
badges-ts discover
```

### `generate`

Generates badges using project metadata, coverage data, and template values.

```bash
badges-ts generate
```

Generation includes:
- npm badge
- coverage badge
- typedoc badge

Coverage is resolved from the first available source:
1. `KIT_CODE_COVERAGE_PERCENT`
2. Coverage summary JSON (`KIT_COVERAGE_SUMMARY_PATH`)
3. LCOV report HTML index (`KIT_LCOV_REPORT_INDEX_PATH`)

### `apply-version`

Creates/updates `src/version.ts` and creates release notes from template for the current package version.

```bash
badges-ts apply-version
```

Behavior notes:
- If the target release-notes file already exists, it is not overwritten.
- If the release-notes template file is missing, the command warns and continues.

### `version`

Prints CLI version.

```bash
badges-ts version
```

### `help`

Prints usage information.

```bash
badges-ts help
```

## Flags

These flags are supported by command context handling:

- `--dry-run`, `-d`: Show what would be written, but do not write files.
- `--quiet`, `-q`: Suppress normal output.
- `--trace`, `-t`: Show trace logs.
- `--warn`, `-w`: Show warning logs.
- `--verbose`: Enable verbose output.

## Configuration Sources

`badges-ts` can read configuration from:
- Environment variables (for example, `KIT_BADGES_FOLDER`)
- Project config file (`badges-ts.json`) using dot keys (for example, `kit.badges.folder`)

## Configuration Profiles

### 1) Default local project profile

Use defaults with explicit color tuning:

```json
{
	"kit.badges.folder": "badges",
	"kit.template.badge.path": "src/data/badge-template.svg.dat",
	"kit.100.percent.color": "#4bc124",
	"kit.above.90.percent.color": "#377526",
	"kit.below.60.percent.color": "darkred",
	"kit.0.percent.color": "#ff0000"
}
```

### 2) Monorepo package profile

Run from repo root, but target a package directory:

```json
{
	"kit.project.folder": "packages/my-library",
	"kit.package.json.path": "package.json",
	"kit.coverage.summary.path": "coverage/coverage-summary.json",
	"kit.lcov.report.index.path": "coverage/lcov-report/index.html",
	"kit.badges.folder": "../../badges",
	"kit.npm.badge.path": "my-library-npm.svg",
	"kit.coverage.summary.badge.path": "my-library-coverage.svg",
	"kit.typedoc.badge.path": "my-library-typedoc.svg"
}
```

### 3) CI-only profile

Use explicit CI paths and injected coverage percent:

```json
{
	"kit.badges.folder": "artifacts/badges",
	"kit.template.badge.path": "src/data/badge-template.svg.dat",
	"kit.coverage.summary.badge.path": "coverage-summary.svg",
	"kit.npm.badge.path": "npm.svg",
	"kit.typedoc.badge.path": "typedoc.svg"
}
```

Example CI command:

```bash
KIT_CODE_COVERAGE_PERCENT=94.6 npx badges-ts generate --verbose
```

### 4) `gh-pages` publishing profile

Write badges to a branch/worktree folder used for site publishing:

```json
{
	"kit.project.folder": ".",
	"kit.badges.folder": "gh-pages/badges",
	"kit.coverage.summary.badge.path": "main-coverage.svg",
	"kit.npm.badge.path": "main-npm.svg",
	"kit.typedoc.badge.path": "main-typedoc.svg",
	"kit.coverage.summary.path": "coverage/coverage-summary.json",
	"kit.lcov.report.index.path": "coverage/lcov-report/index.html"
}
```

If you publish coverage and typedoc to `gh-pages`, keep badge filenames stable (for example `main-*.svg`) so README links do not need to change per run.

Example GitHub Actions step sequence:

```yaml
jobs:
  badges:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main
        uses: actions/checkout@v4
        with:
          path: main-project

      - name: Checkout gh-pages
        uses: actions/checkout@v4
        with:
          ref: gh-pages
          path: gh-pages

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"

      - name: Install and generate badges
        working-directory: main-project
        run: |
          npm ci
          KIT_BADGES_FOLDER="${{ github.workspace }}/gh-pages/badges" npm run badges

      - name: Commit gh-pages badge updates
        uses: EndBug/add-and-commit@v9
        with:
          default_author: github_actions
          message: "Update badges"
          add: "badges/*.svg"
          cwd: gh-pages
```

Artifact-based variant (recommended for privileged publish flows):

```yaml
# Workflow A: unprivileged build/generate (aligned with main-push)
name: main-push
on:
	push:
		branches: [main]

permissions:
	contents: read

jobs:
	build-badges:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4

			- uses: actions/setup-node@v4
				with:
					node-version: "24"

			- run: npm ci
			- run: npm run badges

			- uses: actions/upload-artifact@v4
				with:
					name: publish-badges
					path: "*.svg"
```

```yaml
# Workflow B: privileged publisher (aligned with main-push-publish)
name: main-push-publish
on:
	workflow_run:
		workflows: [main-push]
		types: [completed]

permissions:
	actions: read
	contents: write

jobs:
	publish:
		if: ${{ github.event.workflow_run.conclusion == 'success' }}
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
				with:
					ref: gh-pages
					path: gh-pages

			- uses: actions/download-artifact@v4
				with:
					github-token: ${{ secrets.GITHUB_TOKEN }}
					run-id: ${{ github.event.workflow_run.id }}
					name: publish-badges
					path: gh-pages/badges

			- uses: EndBug/add-and-commit@v9
				with:
					default_author: github_actions
					message: "Update badges"
					add: "badges/*.svg"
					cwd: gh-pages
```

## Key Configuration Values

### Project and paths

- `KIT_PROJECT_FOLDER` / `kit.project.folder` (default: `./`)
- `KIT_BADGES_CONFIG_PATH` / `kit.badges.config.path` (default: `badges-ts.json`)
- `KIT_PACKAGE_JSON_PATH` / `kit.package.json.path` (default: `package.json`)
- `KIT_BADGES_FOLDER` / `kit.badges.folder`
- `KIT_TEMPLATE_BADGE_PATH` / `kit.template.badge.path` (default: internal template)

### Coverage inputs

- `KIT_CODE_COVERAGE_PERCENT` / `kit.code.coverage.percent`
- `KIT_COVERAGE_SUMMARY_PATH` / `kit.coverage.summary.path` (default: `coverage/coverage-summary.json`)
- `KIT_LCOV_REPORT_INDEX_PATH` / `kit.lcov.report.index.path` (default: `coverage/lcov-report/index.html`)

### Badge outputs

- `KIT_NPM_BADGE_PATH` / `kit.npm.badge.path` (default: `npm-badge.svg`)
- `KIT_COVERAGE_SUMMARY_BADGE_PATH` / `kit.coverage.summary.badge.path` (default: `coverage-summary.svg`)
- `KIT_TYPEDOC_BADGE_PATH` / `kit.typedoc.badge.path` (default: `typedoc-badge.svg`)

### Release/version outputs

- `KIT_VERSION_TS_PATH` / `kit.version.ts.path` (default: `src/version.ts`)
- `KIT_RELEASE_NOTES_OUTPUT_FOLDER` / `kit.release.notes.output.folder` (default: `notes`)
- `KIT_RELEASE_NOTES_TEMPLATE_PATH` / `kit.release.notes.template.path` (default: `notes/release-notes-template.md`)

### Color thresholds

- `KIT_100_PERCENT_COLOR` / `kit.100.percent.color`
- `KIT_ABOVE_90_PERCENT_COLOR` / `kit.above.90.percent.color`
- `KIT_ABOVE_80_PERCENT_COLOR` / `kit.above.80.percent.color`
- `KIT_ABOVE_70_PERCENT_COLOR` / `kit.above.70.percent.color`
- `KIT_ABOVE_60_PERCENT_COLOR` / `kit.above.60.percent.color`
- `KIT_BELOW_60_PERCENT_COLOR` / `kit.below.60.percent.color`
- `KIT_0_PERCENT_COLOR` / `kit.0.percent.color`

## Badge Template

Default template location:
- `src/data/badge-template.svg.dat`

Supported template placeholders:
- `{{LABEL}}`
- `{{VALUE}}`
- `{{COLOR}}`

Example override:

```bash
KIT_TEMPLATE_BADGE_PATH=./my-template.svg badges-ts generate
```

## API Surface (Package Exports)

The package exports include:
- `Badge`, `Badges`
- `BadgeConfig`, `BadgesConfig`
- `BadgeException`
- `Installer`, `InstallerConfig`
- `createInstaller`
- `VERSION`

See generated TypeDoc for full API details:
- https://jonloucks.github.io/badges-ts/typedoc/

## Troubleshooting

- **No badges generated**: run with `--trace` and confirm coverage source files exist.
- **Template issues**: verify `KIT_TEMPLATE_BADGE_PATH` points to a readable SVG template file.
- **Release notes not created**: ensure template path exists or provide `KIT_RELEASE_NOTES_TEMPLATE_PATH`.
- **Unexpected colors**: check configured color variances and percent input values.
