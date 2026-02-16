# @jonloucks/badges-ts v1.0.3
```bash
npm install @jonloucks/badges-ts@1.0.3
```

## Customer impact
*  **CLI reliability improved**: `npx badges-ts` now launches through a dedicated Node entrypoint, preventing shell parsing errors in production installs.
*  **Cross-platform confidence increased**: Release packaging is now validated through integration tests that install and execute the packed artifact.

## Forked Repositories Impact
*  If a fork customized the CLI `bin` path, sync the `bin` mapping change in package metadata to use `bin/badges-ts.js`.

## 🚀 New Features

*  Added a dedicated packaged CLI launcher: [src/bin/badges-ts.ts](../src/bin/badges-ts.ts)
*  Added CI integration test workflow to package, install, and execute the published artifact across Node 18/20/22/24: [.github/workflows/integration-tests.yml](../.github/workflows/integration-tests.yml)
*  Added smoke test project used by integration workflow: [src/test/smoke/package.json](../src/test/smoke/package.json)

## ✨ Improvements

*   Performance: Added post-generation status logging to improve CLI output visibility during batch generation in [src/impl/BadgeFactory.impl.ts](../src/impl/BadgeFactory.impl.ts)
*   Compatibility: Updated package `bin` mapping from `cli.js` to `bin/badges-ts.js` in [package.json](../package.json)
*   Documentation: None

## 🐛 Bug Fixes
*  Fixed production CLI startup issue where some environments attempted to parse transpiled JavaScript as shell, causing errors like:
	* `syntax error near unexpected token '('`
	* Triggered from `node_modules/.bin/badges-ts` in affected installs
*  Consolidated executable shebang usage in launcher file and removed shebang from core command module in [src/cli.ts](../src/cli.ts)

## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.0.3)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.3.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.3.tar.gz)
