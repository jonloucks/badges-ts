# @jonloucks/badges-ts

## Badges
[![CI](https://github.com/jonloucks/badges-ts/workflows/main-push/badge.svg)](https://github.com/jonloucks/badges-ts/actions)
[![npm version](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-npm.svg)](https://www.npmjs.com/package/@jonloucks/badges-ts)
[![Coverage Badge](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-coverage.svg)](https://jonloucks.github.io/badges-ts/lcov-report/)
[![Typedoc Badge](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-typedoc.svg)](https://jonloucks.github.io/badges-ts/typedoc/)

`badges-ts` is a TypeScript/Node.js CLI for generating SVG project badges (npm version, coverage, and typedoc) with configurable colors, file paths, and templates.

## Installation

```bash
npm install @jonloucks/badges-ts
```

For one-off usage, you can also run with `npx`.

## Quick Start

### 1) Discover project metadata

```bash
npx badges-ts discover
```

### 2) Generate badges

```bash
npx badges-ts generate --verbose
```

By default this creates:
- `npm-badge.svg`
- `coverage-summary.svg`
- `typedoc-badge.svg`

### 3) Apply version artifacts

```bash
npx badges-ts apply-version
```

This updates `src/version.ts` and creates release notes for the current package version if a release notes file does not already exist.

## CLI Commands

- `badges-ts discover` — Reads project metadata from `package.json`.
- `badges-ts generate` — Generates npm, coverage, and typedoc badges.
- `badges-ts apply-version` — Writes `src/version.ts` and creates release-notes file from template.
- `badges-ts version` — Prints CLI version.
- `badges-ts help` — Prints usage.

### Common flags

- `--dry-run`, `-d` — Preview writes without writing files.
- `--quiet`, `-q` — Suppress standard output.
- `--trace`, `-t` — Enable trace logs.
- `--warn`, `-w` — Enable warning logs.
- `--verbose` — Enable verbose output.

## Configuration

`badges-ts` supports both environment variables and a project config file (`badges-ts.json`).

See [Configuration Profiles](DOCUMENTATION.md#configuration-profiles) for ready-to-use examples (default, monorepo, and CI-only).

Example:

```json
{
  "kit.badges.folder": "badges",
  "kit.coverage.summary.path": "coverage/coverage-summary.json",
  "kit.coverage.summary.badge.path": "main-coverage.svg",
  "kit.npm.badge.path": "main-npm.svg",
  "kit.typedoc.badge.path": "main-typedoc.svg",
  "kit.template.badge.path": "src/data/badge-template.svg.dat",
  "kit.above.90.percent.color": "#377526",
  "kit.0.percent.color": "#ff0000"
}
```

The default badge SVG template is custom/original and stored at `src/data/badge-template.svg.dat`.
You can override it with `KIT_TEMPLATE_BADGE_PATH`:

```bash
KIT_TEMPLATE_BADGE_PATH=./my-template.svg npx badges-ts generate
```

## Documentation

- [Full Documentation](DOCUMENTATION.md)
- [TypeDoc API](https://jonloucks.github.io/badges-ts/typedoc/)
- [Coverage Report](https://jonloucks.github.io/badges-ts/lcov-report)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Coding Standards](CODING_STANDARDS.md)
- [Security Policy](SECURITY.md)

## Development

```bash
npm install
npm run build
npm run test
npm run lint
npm run docs
npm run badges
```

## License

MIT
