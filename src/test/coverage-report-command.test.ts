import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { existsSync } from "node:fs";
import { resolve } from "path";
import { KIT_COVERAGE_FOLDER, KIT_COVERAGE_REPORT_FOLDER, KIT_LCOV_REPORT_INDEX_PATH, KIT_PROJECT_FOLDER } from "@jonloucks/badges-ts/api/Variances";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";

describe('ts-badges coverage-report', () => {
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

  function getLcovReportIndexPath(context: Context): string {
    return resolve(
      context.environment.getVariance(KIT_PROJECT_FOLDER),
      context.environment.getVariance(KIT_COVERAGE_FOLDER),
      context.environment.getVariance(KIT_COVERAGE_REPORT_FOLDER),
      context.environment.getVariance(KIT_LCOV_REPORT_INDEX_PATH));
  }

  describe('ts-badges coverage-report', () => {
    it('should create coverage report', async () => {
      const context: Context = sandbox.toContext(['coverage-report']);
      const indexFile: string = getLcovReportIndexPath(context);

      await runMain(context);

      ok(existsSync(indexFile), 'Coverage report index file should be created');
      assertNoErrors();
    });
  });
});
