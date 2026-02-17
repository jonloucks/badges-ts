# @jonloucks/badges-ts

## Badges
[![CI](https://github.com/jonloucks/badges-ts/workflows/main-push/badge.svg)](https://github.com/jonloucks/badges-ts/actions)
[![npm version](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-npm.svg)](https://www.npmjs.com/package/@jonloucks/badges-ts)
[![Coverage Badge](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-coverage.svg)](https://jonloucks.github.io/badges-ts/lcov-report/)
[![Typedoc Badge](https://raw.githubusercontent.com/jonloucks/badges-ts/refs/heads/badges/main-typedoc.svg)](https://jonloucks.github.io/badges-ts/typedoc/)


Typescript badge maker

## Documentation
* [License](LICENSE.md)
* [Contributing](CONTRIBUTING.md)
* [Code of conduct](CODE_OF_CONDUCT.md)
* [Coding standards](CODING_STANDARDS.md)
* [Security policy](SECURITY.md)
* [Pull request template](PULL_REQUEST_TEMPLATE.md)
* [How to use API](https://jonloucks.github.io/badges-ts/typedoc/)
* [Test coverage report](https://jonloucks.github.io/badges-ts/lcov-report)

## Installation

```bash
npm install @jonloucks/badges-ts
```

## Usage 

<details markdown="1"><summary>Importing the Package</summary>

```typescript
import { 
  createBadge, 
  BadgeConfig 
  } from '@jonloucks/badges-ts';
```

</details>

<details markdown="1"><summary>Importing the Convenience Package</summary>

```typescript
import {
  createBadge, 
  BadgeConfig 
} from "@jonloucks/badges-ts/api/Convenience";
```

</details>

<details markdown="1"><summary>Creating a Contract</summary>

```typescript

```
</details>

<details markdown="1"><summary>Binding a Contract</summary>

```typescript

```
</details>

<details markdown="1"><summary>Using the Contract</summary>

```typescript
const logger : Logger = enforce<Logger>(LOGGER_CONTRACT);
logger.log("Using the service in the test.");
```
</details>

## Development

<details markdown="1"><summary>Install dependencies</summary>

```bash
npm install
```
</details>

<details markdown="1"><summary>Build the project</summary>

```bash
npm run build
```
</details>

<details markdown="1"><summary>Run tests</summary>

```bash
npm test
```
</details>

<details markdown="1"><summary>Run tests in watch mode</summary>

```bash
npm run test:watch
```
</details>

<details markdown="1"><summary>Run test coverage</summary>

```bash
npm run test:coverage
```
</details>

<details markdown="1"><summary>Lint the code</summary>

```bash
npm run lint
```
</details>

<details markdown="1"><summary>Fix linting issues</summary>

```bash
npm run lint:fix
```
</details>

<details markdown="1"><summary>Generate documents</summary>

```bash
npm run docs
```
</details>

<details markdown="1"><summary>Generate badges</summary>

```bash
npm run badges
```
</details>

<details markdown="1"><summary>Project Structure</summary>

* All tests must have suffix of -test.ts or -spec.ts
* Tests that validate supported APIs go in src/test
* Tests that validate internal implementation details go in src/impl

```
badges-ts
├── .github
│   ├── ISSUE_TEMPLATE
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows
│       ├── main-pull-request-matrix.yml
│       ├── main-pull-request.yml
│       ├── main-push.yml
│       ├── main-push-publish.yml
│       └── main-release.yml
├── CODE_OF_CONDUCT.md
├── CODING_STANDARDS.md
├── CONTRIBUTING.md
├── editorconfig
├── eslint.config.mjs
├── jest.config.js
├── LICENSE
├── package-lock.json
├── package.json
├── PULL_REQUEST_TEMPLATE.md
├── README.md
├── scripts
│   ├── badge-template.svg.dat
│   └── tsconfig.json
├── SECURITY.md
├── src
│   ├── index.ts
│   ├── version.ts
│   ├── api
│   │   ├── *.ts
│   │   ├── *.api.ts
│   ├── auxiliary
│   │   ├── *.ts
│   │   ├── *.impl.ts
│   │   ├── *.test.ts    // internal implementation specific
│   │   └── *.api.ts
│   ├── impl
│   │   ├── *.ts
│   │   ├── *.impl.ts
│   │   ├── *.test.ts    // internal implementation specific
│   │   └── *.api.ts
│   ├── test
│   │   └── *.test.ts
│   └── never-publish             // non shippable development scripts
│       ├── *.ts
│       ├── *.*.                  // data files etc
│       └── *.test.ts
├── tsconfig.json
└── typedoc.json
```
</details>

## GitHub Workflows

<details markdown="1"><summary>Workflow File Index</summary>

- `main-pull-request.yml` (workflow name: `main-pull-request`): Pull request validation workflow for `main` (lint, build, coverage on Node 18).
- `main-pull-request-matrix.yml` (workflow name: `main-pull-request-matrix`): Pull request validation matrix for `main` (lint, build, coverage across Node 18/20/22/24).
- `main-pull-request-smoke.yml` (workflow name: `main-pull-request-smoke`): Pull request smoke packaging workflow with multi-version smoke test matrix.
- `main-push.yml` (workflow name: `main-push`): Unprivileged push workflow for `main` that builds/tests and uploads publish artifacts.
- `main-push-publish.yml` (workflow name: `main-push-publish`): Privileged `workflow_run` publisher that updates `gh-pages` and `badges` from artifacts.
- `main-push-smoke.yml` (workflow name: `main-push-smoke`): Push smoke packaging workflow with multi-version smoke test matrix.
- `main-release-smoke.yml` (workflow name: `main-release-smoke`): Release-created smoke workflow that builds package and validates install/tests.
- `main-release.yml` (workflow name: `Publish`): Release publishing workflow triggered after smoke success.

</details>

<details markdown="1"><summary>CI Workflow</summary>

The CI workflow runs on every push and pull request to `main` branch. It:
- Tests against Node.js versions 18.x, 20.x, 22.x, and 24.x
- Runs linting
- Builds the project
- Runs tests with coverage
- Uploads build outputs as workflow artifacts for downstream jobs

Security model:
- Pull request workflows run with read-only repository permissions.
- `main-push` runs as an unprivileged build/test workflow and uploads publish artifacts.
- `main-push-publish` is a separate `workflow_run` workflow that downloads artifacts and performs privileged writes to `gh-pages` and `badges` branches.

</details>

<details markdown="1"><summary>Publish Workflow</summary>

The GitHub publishings workflows are run to make an official release.
- If all scanning and tests pass it is published. There is no other way allowed.
- Publishing authentication is done using ([OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers))

To set up your own publishing:
1. Publishing this project as is intentionally disabled
2. You are welcome to fork this repository and publish where you want.
3. Run `npm pkg delete private` to remove the `private` flag from the package.
4. Change the `name` field in `package.json` to your desired package name.

</details>

## License

MIT
