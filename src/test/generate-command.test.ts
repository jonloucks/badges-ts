import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "path";
import { getCodeCoverageBadgePath, getNpmBadgePath, getTypedocBadgePath } from "@jonloucks/badges-ts/api/Variances";
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

      const npmBadgePath: string = getNpmBadgePath(context);
      const typedocBadgePath: string = getTypedocBadgePath(context);
      const coverageSummaryBadgePath: string = getCodeCoverageBadgePath(context);

      ok(existsSync(npmBadgePath), 'NPM badge should be created');
      ok(existsSync(typedocBadgePath), 'Typedoc badge should be created');
      ok(existsSync(coverageSummaryBadgePath), 'Coverage summary badge should be created');
      assertNoErrors();
    });
  });

  describe('ts-badges generate with KIT_CODE_COVERAGE_PERCENT set', () => {
    it('should generate badges', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', '85');
      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);

      const expectedBadgePath = getCodeCoverageBadgePath(context);

      ok(existsSync(expectedBadgePath), 'Coverage summary badge should be created');
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

  describe('ts-badges generate from lcov.info totals', () => {
    it('should derive average percentage from lines/functions/branches totals', async () => {
      const summaryPath: string = resolve(sandbox.folder, 'summary.junk.dat');
      const lcovReportPath: string = resolve(sandbox.folder, 'lcov.junk.dat');
      const lcovInfoPath: string = resolve(sandbox.folder, 'lcov.info');

      sandbox.setVariance('KIT_COVERAGE_SUMMARY_PATH', summaryPath);
      sandbox.setVariance('KIT_LCOV_REPORT_INDEX_PATH', lcovReportPath);
      sandbox.setVariance('KIT_LCOV_INFO_PATH', lcovInfoPath);

      writeFileSync(summaryPath, 'corrupted', 'utf8');
      writeFileSync(lcovReportPath, 'corrupted', 'utf8');
      writeFileSync(lcovInfoPath, [
        'TN:',
        'SF:src/example.ts',
        'LF:10',
        'LH:8',
        'FNF:5',
        'FNH:4',
        'BRF:4',
        'BRH:2',
        'end_of_record'
      ].join('\n'), 'utf8');

      const context: Context = sandbox.toContext(['generate']);
      await runMain(context);

      const coverageSummaryBadgePath: string = getCodeCoverageBadgePath(context);
      const generatedBadge: string = readFileSync(coverageSummaryBadgePath, 'utf8');

      ok(generatedBadge.includes('70.0%'), 'Coverage badge should include average percent derived from lcov.info totals');
      assertNoErrors();
    });
  });
});

