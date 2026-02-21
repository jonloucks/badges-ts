import { ok, strictEqual } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";
import { runMain } from "@jonloucks/badges-ts/cli";
import { writeFileSync } from "node:fs";
import { KIT_PACKAGE_JSON_PATH, KIT_PROJECT_FOLDER } from "@jonloucks/badges-ts/api/Variances";
import { resolve } from "node:path";

describe('discover-command tests', () => {
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

  describe('ts-badges discover', () => {

    it('should discover project from valid package.json', async () => {
      const context: Context = sandbox.toContext(['discover']);
      await runMain(context);
      const mockInfoFn = sandbox.getLog('info');
      const projectInfoCall = mockInfoFn.mock.calls.find(call => call.arguments[0].includes('Discovered project:'));
      ok(projectInfoCall !== undefined, 'info should be called with project discovery message');
      const projectInfo = projectInfoCall.arguments[0];
      ok(projectInfo.includes('@test/my-package'), 'project name should be included in discovery message');
      ok(projectInfo.includes('1.2.3'), 'project version should be included in discovery message');
      assertNoErrors();
    });

    it('should discover project from package.json with missing repository', async () => {
      const context: Context = sandbox.toContext(['discover']);
      const projectFolder = resolve(context.environment.getVariance(KIT_PROJECT_FOLDER));
      const packageJsonPath = resolve(projectFolder, context.environment.getVariance(KIT_PACKAGE_JSON_PATH));
      const packageJson = {
        name: "@test/my-package",
        version: "1.2.3",
        repository: {
          // url is intentionally missing to test discovery with incomplete repository information
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');
      await runMain(context);
      const mockInfoFn = sandbox.getLog('info');
      const projectInfoCall = mockInfoFn.mock.calls.find(call => call.arguments[0].includes('Discovered project:'));
      ok(projectInfoCall !== undefined, 'info should be called with project discovery message');
      const projectInfo = projectInfoCall.arguments[0];
      ok(projectInfo.includes('@test/my-package'), 'project name should be included in discovery message');
      ok(projectInfo.includes('1.2.3'), 'project version should be included in discovery message');
    });

    it('should not discover project from invalid package.json', async () => {
      const context: Context = sandbox.toContext(['discover']);
      const projectFolder = resolve(context.environment.getVariance(KIT_PROJECT_FOLDER));
      const packageJsonPath = resolve(projectFolder, context.environment.getVariance(KIT_PACKAGE_JSON_PATH));
      const packageJson = {
        xname: "@test/my-package",
        xversion: "1.2.3",
        xrepository: {
          url: "https://github.com/test/my-package.git"
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');

      await runMain(context)
        .catch((error) => {
          strictEqual(error.message, "Unable to discover project using available methods.");
        });
      assertHadErrors();
    });

    it('should not discover project from non existing package.json', async () => {
      sandbox.setVariance('KIT_PACKAGE_JSON_PATH', 'non-existant-package.json');
      const context: Context = sandbox.toContext(['discover']);
      await runMain(context)
        .catch((error) => {
          strictEqual(error.message, "Unable to discover project using available methods.");
        });
      assertHadErrors();
    });
  });
});