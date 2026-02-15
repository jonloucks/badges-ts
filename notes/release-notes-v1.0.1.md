# @jonloucks/badges-ts v1.0.1
```bash
npm install @jonloucks/badges-ts@1.0.1
```

## Customer Impact
* **Patch Release**: This is a minor patch release with bug fixes - no breaking changes
* **Version Export Available**: The version module is now properly exported in the published package

## 🐛 Bug Fixes

* **Missing Version Export** ([#28](https://github.com/jonloucks/badges-ts/pull/28)): Fixed issue [#26](https://github.com/jonloucks/badges-ts/issues/26) where the version module was not properly exported in the package exports configuration
  - Added `./version` export to `package.json` exports field
  - Allows consuming packages to import version information: `import { VERSION } from '@jonloucks/badges-ts/version'`
  - Updated `.gitignore` to exclude generated version file from version control

* **Sinon Dependency Cleanup** ([#29](https://github.com/jonloucks/badges-ts/pull/29)): Removed sinon from production dependencies
  - sinon is a testing library and should only be a dev dependency
  - Reduces production bundle size by removing unnecessary test tooling
  - No impact on functionality - sinon remains available for tests via dev dependencies

## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.0.1)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.1.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.1.tar.gz)
