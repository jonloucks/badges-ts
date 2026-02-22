# @jonloucks/badges-ts v1.3.0
```bash
npm install @jonloucks/badges-ts@1.3.0
```

## Customer impact
*  Coverage badge generation is now more resilient when `coverage-summary.json` or `lcov-report/index.html` are unavailable.

## Forked Repositories Impact
*  None

## 🚀 New Features

*  Added `lcov.info` coverage parsing support as an additional coverage source.
*  Coverage percent can now be derived from LCOV totals for lines, functions, and branches.

## ✨ Improvements

*   Performance: Reduced fallback failures by supporting direct LCOV totals parsing.
*   Compatibility: Added support for projects that only publish `coverage/lcov.info`.
*   Documentation: Updated coverage documentation to describe `KIT_LCOV_INFO_PATH` and `lcov.info` as a coverage source.

## 🐛 Bug Fixes
*  None
## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.3.0)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.3.0.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.3.0.tar.gz)
