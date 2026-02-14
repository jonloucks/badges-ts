# @jonloucks/badges-ts v1.0.0
```bash
npm install @jonloucks/badges-ts@1.0.0
```

## 🎉 Major Release - v1.0.0

This is the first **major release** of badges-ts, marking the transition to a stable, production-ready API. This release includes adoption of contracts-ts 2.x and migration from Jest to Node.js built-in test runner.

## Customer Impact
* **Testing Framework Migration**: Internal testing framework migrated from Jest to Node.js built-in `node:test` - **no impact on end users**
* **Contracts Dependency Update**: Updated to `@jonloucks/contracts-ts` v2.x - **existing code continues to work**
* **Enhanced Coverage Detection**: Coverage badges can now be generated from lcov reports in addition to coverage-summary.json

## 🚀 New Features

* **Fallback Coverage Parsing** ([#20](https://github.com/jonloucks/badges-ts/pull/20)): Badge generation now supports reading coverage data from `coverage/lcov-report/index.html` as a fallback when `coverage-summary.json` is not available
  - Uses `Promise.any()` to try multiple coverage sources
  - Parses HTML to extract Statements, Branches, Functions, and Lines percentages
  - Prioritizes Lines percentage, falls back to Statements if Lines not found

## ✨ Improvements

### Testing Infrastructure ([#19](https://github.com/jonloucks/badges-ts/pull/19))
* **Migrated from Jest to Node.js `node:test`**: Complete test suite migrated to use Node.js built-in test runner
  - Replaced Jest's `describe`, `it`, `expect` with node:test equivalents
  - Migrated mocking from `jest.spyOn()` to `sinon.stub()`
  - All 145 tests passing with zero failures
  - **Removed Jest dependency** - reduced package size and complexity

### Dependency Management
* **Updated to [@jonloucks/contracts-ts v2.0.0](https://github.com/jonloucks/contracts-ts)** ([#19](https://github.com/jonloucks/badges-ts/pull/19)): Major version bump to contracts-ts with enhanced type safety
* **Added test tooling**:
  - `sinon` v19.0.2 for mocking
  - `@types/sinon` v17.0.3 for TypeScript support
  - `tsx` v4.19.2 for running TypeScript tests
  - `c8` v10.1.3 for code coverage reporting

### Code Quality
* **TypeScript Configuration** ([#19](https://github.com/jonloucks/badges-ts/pull/19)):
  - Added `"types": ["node"]` for proper node:test support
  - Enhanced strict mode configurations
  - Better ESM compatibility
* **ESLint Configuration** ([#19](https://github.com/jonloucks/badges-ts/pull/19), [#21](https://github.com/jonloucks/badges-ts/pull/21)):
  - Updated to support test file-specific globals (`describe`, `it`, `beforeEach`, `afterEach`)
  - Added dependabot ignore configuration for eslint updates
  - Improved linting rules consistency

### CI/CD Improvements ([#19](https://github.com/jonloucks/badges-ts/pull/19))
* Updated GitHub Actions workflows for node:test
* Enhanced pull request and push workflows
* Better test matrix configuration

### Documentation
* **TypeDoc** updated to v0.28.17 ([#22](https://github.com/jonloucks/badges-ts/pull/22))

## 🐛 Bug Fixes
* **CLI ESM Compatibility** ([#19](https://github.com/jonloucks/badges-ts/pull/19)): Fixed `require.main` usage in ESM context - replaced with `import.meta.url` for proper module detection
* **Test Coverage** ([#19](https://github.com/jonloucks/badges-ts/pull/19)): Enhanced test coverage for file overwrite scenarios in apply-version command
* **Coverage Threshold** ([#20](https://github.com/jonloucks/badges-ts/pull/20)): Adjusted coverage gates to 90% (lines, functions, branches, statements) to maintain quality standards

## 📦 Dependency Changes

### Dependencies
* `@jonloucks/contracts-ts`: `1.4.0` → `2.0.0` ⚠️ **MAJOR UPDATE**

### Dev Dependencies Added
* `sinon`: `^19.0.2` (new)
* `@types/sinon`: `^17.0.3` (new)
* `tsx`: `^4.19.2` (new)
* `c8`: `^10.1.3` (new)

### Dev Dependencies Removed
* `jest` (removed - replaced with node:test)
* `@types/jest` (removed)
* `ts-jest` (removed)

### Dev Dependencies Updated
* `typedoc`: `0.28.16` → `0.28.17`

## 🔄 Migration Guide for Developers

### For End Users (No Changes Required)
If you are using `@jonloucks/badges-ts` as a library or CLI tool, **no changes are required**. The public API remains fully compatible.

### For Contributors/Forked Repositories
If you have forked this repository or are contributing:

1. **Testing Framework Change**:
   - Tests now use `node:test` instead of Jest
   - Replace `expect(x).toBe(y)` with `strictEqual(x, y)` from `node:assert`
   - Replace `jest.spyOn()` with `sinon.stub()`
   - Run tests with: `npm test` (uses `tsx --test`)

2. **Contracts-ts 2.x**:
   - Update any direct usage of `@jonloucks/contracts-ts` to v2.x
   - Review [contracts-ts migration guide](https://github.com/jonloucks/contracts-ts) if using advanced features

3. **ESLint Configuration**:
   - Test files now have custom globals configuration
   - Ensure your editor/IDE picks up the updated `eslint.config.mjs`

## 🔧 Issues Resolved
* [#19](https://github.com/jonloucks/badges-ts/pull/19) - Major release 1.0.0: Adopt contracts-ts 2.x and migrate to node:test
* [#20](https://github.com/jonloucks/badges-ts/pull/20) - Fallback coverage detection from lcov-report/index.html
* [#21](https://github.com/jonloucks/badges-ts/pull/21) - Add eslint to dependabot ignore list
* [#22](https://github.com/jonloucks/badges-ts/pull/22) - Bump typedoc from 0.28.16 to 0.28.17

## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.0.0)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.0.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.0.tar.gz)

---

## What's Next?

Version 1.0.0 establishes a solid foundation with:
- ✅ Stable public API
- ✅ Modern testing infrastructure
- ✅ Enhanced type safety
- ✅ Better coverage detection
- ✅ Reduced dependencies

Future releases will focus on new badge types, additional coverage sources, and performance optimizations.
