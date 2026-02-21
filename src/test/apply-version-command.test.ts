import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { existsSync, readFileSync, statSync } from "fs";
import { resolve } from "node:path";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";

describe('badges-ts apply-version', () => {
  let sandbox: Sandbox;
  let closeSandbox: AutoClose;
  let releaseNotesFile: string;

  beforeEach(() => {
    sandbox = createSandbox();
    closeSandbox = sandbox.open();
    releaseNotesFile = resolve(sandbox.folder, "release-notes-v1.2.3.md");
  });

  afterEach(() => {
    closeSandbox.close();
  });

  function toMockContext(args: string[]): Context {
    return sandbox.toContext(args);
  };

  function assertNoErrors(): void {
    const mockErrorFn = sandbox.getLog('error');
    ok(mockErrorFn.mock.calls.length === 0, 'error should not be called');
  }

  function assertHadErrors(): void {
    const mockErrorFn = sandbox.getLog('error');
    ok(mockErrorFn.mock.calls.length > 0, 'error should have been called');
  }

  describe('apply-version', () => {
    it('with template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      await runMain(context);
      ok(existsSync(releaseNotesFile), 'Release notes file should be created');
      assertNoErrors();
    });

    it('with template file but missing src directory', async () => {
      sandbox.setVariance('KIT_VERSION_TS_PATH', 'non-existant-src/version.ts');
      const context: Context = toMockContext(['apply-version', '--quiet']);
      await runMain(context)
        .catch((error: Error) => {
          ok(error instanceof Error, 'Error should be thrown when the directory does not exist');
          ok(error.message.includes('ENOENT'), 'Error message should indicate missing file or directory');
        });
      assertHadErrors();
    });

    it('twice with template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      await runMain(context);

      ok(existsSync(releaseNotesFile), 'Release notes file should be created');

      const firstContent = readFileSync(releaseNotesFile, 'utf8');
      const firstModifiedTime = statSync(releaseNotesFile).mtime;

      // Wait a bit to ensure timestamp would change if file was rewritten
      await new Promise(resolve => setTimeout(resolve, 10));

      await runMain(context);

      const secondContent = readFileSync(releaseNotesFile, 'utf8');
      const secondModifiedTime = statSync(releaseNotesFile).mtime;

      ok(firstContent === secondContent, 'Release notes content should not change');
      ok(firstModifiedTime.getTime() === secondModifiedTime.getTime(), 'Release notes file should not be overwritten');
      assertNoErrors();
    });

    it('should be callable without template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      sandbox.setVariance('KIT_RELEASE_NOTES_TEMPLATE_PATH', resolve(sandbox.folder, 'non-existent-template.md'));
      await runMain(context);
      assertNoErrors();
    });
  });
});
