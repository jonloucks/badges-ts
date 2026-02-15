# @jonloucks/badges-ts v1.0.2
```bash
npm install @jonloucks/badges-ts@1.0.2
```

## Customer Impact
* **Improved Node.js Compatibility**: Package now supports older Node.js versions starting from Node 16.0.0 (previously required Node 20.11.0+)
* **Wider Adoption**: Users on Node 16 LTS and Node 18 LTS can now use this package

## ✨ Improvements

### Compatibility
* **Node.js Version Support**: Added explicit `engines` field to package.json specifying `>=16.0.0` requirement
* **Backward Compatibility Enhancement**: Implemented fallback for `import.meta.dirname` to support Node versions before 20.11.0
  - Uses `import.meta.dirname` when available (Node 20.11.0+)
  - Falls back to `dirname(fileURLToPath(import.meta.url))` for Node 16-20.10
  - Ensures compatibility across Node 16, 18, 20, and future versions

### Technical Details
* **Updated**: [src/data/Resolver.ts](../src/data/Resolver.ts) - Implemented nullish coalescing fallback pattern for ESM dirname resolution
* **Added**: `engines` field in package.json to document minimum Node version requirement

## 🔧 Node.js Version Compatibility

| Environment | Minimum Version | Recommended |
|------------|-----------------|-------------|
| **Production Runtime** | Node 16.0.0 | Node 20+ |
| **Development/Build** | Node 18.18.0 | Node 20+ |
| **Testing** | Node 18.18.0 | Node 20+ |

**Note for Contributors**: While production code runs on Node 16+, development requires Node 18.18.0+ due to ESLint 9.x and the `node:test` module.

## ⬇️ Download

*   [NPM](https://www.npmjs.com/package/@jonloucks/badges-ts/v/1.0.2)
*   [Source code (zip)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.2.zip)
*   [Source code (tar.gz)](https://github.com/jonloucks/badges-ts/archive/refs/tags/v1.0.2.tar.gz)
