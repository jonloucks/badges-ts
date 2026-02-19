import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "path";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";

describe('badges-ts generate', () => {
  let sandbox: Sandbox;
  let closeSandbox: AutoClose;

  beforeEach(() => {
    sandbox = createSandbox();
    closeSandbox = sandbox.open();
  });

  afterEach(() => {
    closeSandbox.close();
  });

  function assertNoErrors(): void {
    const mockErrorFn = sandbox.getLog('error');
    ok(mockErrorFn.mock.calls.length === 0, 'error should not be called');
  }

  describe('ts-badges generate', () => {
    it('should generate badges from valid package.json', async () => {
      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);

      ok(existsSync(resolve(sandbox.folder, 'npm-badge.svg')), 'NPM badge should be created');
      ok(existsSync(resolve(sandbox.folder, 'typedoc-badge.svg')), 'Typedoc badge should be created');
      ok(existsSync(resolve(sandbox.folder, 'coverage-summary.svg')), 'Coverage summary badge should be created');
      assertNoErrors();
    });
  });

  describe('ts-badges generate with KIT_CODE_COVERAGE_PERCENT set', () => {
    it('should generate badges', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', '85');
      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);

      ok(existsSync(resolve(sandbox.folder, 'coverage-summary.svg')), 'Coverage summary badge should be created');
      assertNoErrors();
    });
  });

  describe('ts-badges generate with corrupt lcov report', () => {
    it('should generate badges from valid package.json', async () => {
      const path: string = resolve(sandbox.folder, 'summary.junk.dat');
      sandbox.setVariance('KIT_COVERAGE_SUMMARY_PATH', path);
      writeFileSync(path, '""', 'utf8');
      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);

      assertNoErrors();
    });
  });

  describe('ts-badges generate with corrupt lcov report', () => {
    it('should generate badges from valid package.json', async () => {
      const lcovReportPath: string = resolve(sandbox.folder, 'lcov.junk.dat');
      sandbox.setVariance('KIT_LCOV_REPORT_INDEX_PATH', lcovReportPath);
      writeFileSync(lcovReportPath, 'corrupted or unexpected content', 'utf8');
      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);
      
      assertNoErrors();
    });
  });
});
