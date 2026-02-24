import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";

describe('ts-badges coverage-gate', () => {
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

  function assertHadErrors(): void {
    const mockErrorFn = sandbox.getLog('error');
    ok(mockErrorFn.mock.calls.length > 0, 'error should have been called');
  }

  describe('ts-badges coverage-gate with no gate', () => {
    it('should create coverage report', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', "1");
      const context: Context = sandbox.toContext(['coverage-gate']);
      await runMain(context);

      assertNoErrors();
    });
  });

  describe('ts-badges coverage-gate with passing gate', () => {
    it('should create coverage report', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', "99");
      sandbox.setVariance('KIT_REQUIRED_CODE_COVERAGE', "90");

      const context: Context = sandbox.toContext(['coverage-gate']);
      await runMain(context);

      assertNoErrors();
    });
  });

  describe('ts-badges coverage-gate with failed gate', () => {
    it('should create coverage report', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', "13");
      sandbox.setVariance('KIT_REQUIRED_CODE_COVERAGE', "90");
      const context: Context = sandbox.toContext(['coverage-gate']);
      await runMain(context).catch((error) => {
        ok(error instanceof Error, 'error should be an instance of Error');
        ok(error.message.includes('Code coverage gate failed'), 'error message should indicate coverage gate failure');
      });

      assertHadErrors();
    });
  });

  describe('ts-badges coverage-gate with failed commandline gate', () => {
    it('should create coverage report', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', "13");
      const context: Context = sandbox.toContext(['coverage-gate', '--required-coverage=90']);
      await runMain(context).catch((error) => {
        ok(error instanceof Error, 'error should be an instance of Error');
        ok(error.message.includes('Code coverage gate failed'), 'error message should indicate coverage gate failure');
      });

      assertHadErrors();
    });
  });

  describe('ts-badges coverage-gate with illegal commandline gate', () => {
    it('should create coverage report', async () => {
      sandbox.setVariance('KIT_CODE_COVERAGE_PERCENT', "13");
      const context: Context = sandbox.toContext(['coverage-gate', '--required-coverage=illegal']);
      await runMain(context).catch((error) => {
        ok(error instanceof Error, 'error should be an instance of Error');
        ok(error.message.includes('Invalid coverage gate value provided'), 'error message should indicate invalid coverage gate value');
      });

      assertHadErrors();
    });
  });
});
