# @jonloucks/badges-ts v1.2.0
```bash
npm install @jonloucks/badges-ts@1.2.0
```

## Customer impact
*  More control over badge colors and generation behavior through config/env variances.
*  More reliable percent handling for coverage-derived badge values.
*  Updated default badge template with improved text centering.

## Forked Repositories Impact
*  Forks with custom badge colors should review new color variances in `src/api/Variances.ts`.
*  Forks that rely on a previous badge look should set `KIT_TEMPLATE_BADGE_PATH`.

## 🚀 New Features

*  Configurable badge color variances added (issue [#42](https://github.com/jonloucks/badges-ts/issues/42)).
*  Runtime project configuration support via `badges-ts.json`.

## ✨ Improvements

*   Performance: Coverage parsing now validates/normalizes percentages before averaging.
*   Compatibility: Updated `@types/node` from `25.2.3` to `25.3.0` (PR [#39](https://github.com/jonloucks/badges-ts/pull/39)).
*   Documentation: Added README guidance for custom template usage and `KIT_TEMPLATE_BADGE_PATH`.

## 🐛 Bug Fixes
*  Fixed issue [#43](https://github.com/jonloucks/badges-ts/issues/43) (PR [#44](https://github.com/jonloucks/badges-ts/pull/44)).
*  Improved command/config handling and strengthened percent formatting/normalization in badge generation.

## 📌 Notable Changes

*  `Internal.colorFromPercentComplete` now resolves colors from environment-backed variances.
*  Badge generation now consistently uses `Internal.formatPercent(...)` for coverage and typedoc values.
*  Default template in `src/data/badge-template.svg.dat` is custom/original and vertically centered.

## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.2.0)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.2.0.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.2.0.tar.gz)
