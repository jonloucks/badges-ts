import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "path";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";
import { KIT_BADGES_FOLDER, KIT_COVERAGE_SUMMARY_BADGE_PATH, KIT_NPM_BADGE_PATH, KIT_PROJECT_FOLDER, KIT_TYPEDOC_BADGE_PATH } from "../api/Variances.js";
import { Variant } from "@jonloucks/variants-ts/api/Variant";

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

      const npmBadgePath: string = resolveBadgePath(context, KIT_NPM_BADGE_PATH);
      const typedocBadgePath: string = resolveBadgePath(context, KIT_TYPEDOC_BADGE_PATH);
      const coverageSummaryBadgePath: string = resolveBadgePath(context, KIT_COVERAGE_SUMMARY_BADGE_PATH);

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

      const expectedBadgePath = resolveBadgePath(context, KIT_COVERAGE_SUMMARY_BADGE_PATH);

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
});

function resolveBadgePath(context: Context, varianceKey: Variant<string>): string {
  const projectFolder: string = context.environment.getVariance(KIT_PROJECT_FOLDER);
  const badgesFolder: string = context.environment.getVariance(KIT_BADGES_FOLDER);
  return resolve(projectFolder, badgesFolder, context.environment.getVariance(varianceKey));
}
