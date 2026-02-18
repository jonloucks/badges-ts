import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it, Mock, mock } from "node:test";

import { createInstaller } from "@jonloucks/badges-ts";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { COMMAND } from "../impl/apply-version-command.js";
import { toContext } from "../impl/Command.impl.js";
import { createEnvironment, createMapSource, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { resolve } from "node:path";

describe('apply-version-command tests', () => {
  const environmentMap: Map<string, string> = new Map<string, string>();
  let closeInstaller: AutoClose;
  let temporaryFolder: string;
  let templatePath: string;
  let mockErrorFn: Mock<(message: string) => void>;

  beforeEach(() => {
    closeInstaller = createInstaller().open();
    // this must be a temporary directory that is cleaned up after the test, and should not be the same as the one used in other tests to avoid conflicts
    temporaryFolder = mkdtempSync(join(tmpdir(), 'apply-version-test-'));
    environmentMap.set('KIT_PROJECT_FOLDER', temporaryFolder);
    // Create necessary directories
    mkdirSync(join(temporaryFolder, 'src')); // review requirements for src directory if needed

    mockErrorFn = mock.fn((message: string): void => {
      used(message);
    });

    // Create a package.json for the test
    const packageJson = {
      name: "@test/test-package",
      version: "0.0.0"
    };
    const packageJsonPath = resolve(temporaryFolder, 'package.json');
    writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');
    environmentMap.set('KIT_PACKAGE_JSON_PATH', packageJsonPath);

    templatePath = resolve(temporaryFolder, 'release-notes-template.md');
    writeFileSync(templatePath, '# {{NAME}} v{{VERSION}}', 'utf8');
    environmentMap.set('KIT_RELEASE_NOTES_TEMPLATE_PATH', templatePath);
    environmentMap.set('KIT_RELEASE_NOTES_OUTPUT_FOLDER', temporaryFolder);
  });

  afterEach(() => {
    closeInstaller.close();
    environmentMap.clear();
    if (temporaryFolder && existsSync(temporaryFolder)) {
      rmSync(temporaryFolder, { recursive: true, force: true });
    }
  });

  function toMockContext(args: string[]): Context {
    const context: Context = toContext(args);

    context.display.error = mockErrorFn;

    context.environment = createEnvironment({
      sources: [
        createMapSource(environmentMap),
        createProcessSource()
      ]
    });

    return context;
  };

  function assertNoErrors(): void {
    ok(mockErrorFn.mock.calls.length === 0, 'error should not be called');
  }

  function assertHadErrors(): void {
    ok(mockErrorFn.mock.calls.length > 0, 'error should not be called');
  }

  describe('COMMAND', () => {
    it('should have execute method', () => {
      ok(typeof COMMAND.execute === 'function', 'COMMAND should have execute method');
    });

    it('with template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      await COMMAND.execute(context);
      ok(existsSync(templatePath), 'Release notes file should be created');
      assertNoErrors();
    });

    it('with template file but missing src directory', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      rmSync(resolve(temporaryFolder, 'src'), { recursive: true, force: true });
      await COMMAND.execute(context)
      .catch((error: Error) => {
        ok(error instanceof Error, 'Error should be thrown when src directory is missing');
        ok(error.message.includes('ENOENT'), 'Error message should indicate missing file or directory');
      });
      assertHadErrors();
    });

    it('twice with template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      await COMMAND.execute(context);

      ok(existsSync(templatePath), 'Release notes file should be created');

      const firstContent = readFileSync(templatePath, 'utf8');
      const firstModifiedTime = statSync(templatePath).mtime;

      // Wait a bit to ensure timestamp would change if file was rewritten
      await new Promise(resolve => setTimeout(resolve, 10));

      await COMMAND.execute(context);

      const secondContent = readFileSync(templatePath, 'utf8');
      const secondModifiedTime = statSync(templatePath).mtime;

      ok(firstContent === secondContent, 'Release notes content should not change');
      ok(firstModifiedTime.getTime() === secondModifiedTime.getTime(), 'Release notes file should not be overwritten');
      assertNoErrors();
    });

    it('should be callable without template file', async () => {
      const context: Context = toMockContext(['apply-version', '--quiet']);
      environmentMap.set('KIT_RELEASE_NOTES_TEMPLATE_PATH', resolve(temporaryFolder, 'non-existent-template.md'));
      await COMMAND.execute(context);
      assertNoErrors();
    });
  });
});
