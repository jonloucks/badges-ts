import { doesNotThrow } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createInstaller } from "@jonloucks/badges-ts";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { toContext } from "../impl/Command.impl.js";
import { createEnvironment, createMapSource, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { runMain } from "@jonloucks/badges-ts/cli";

describe('generate-command tests', () => {
  const environmentMap: Map<string, string> = new Map<string, string>();

  let closeInstaller: AutoClose;
  let temporaryFolder: string;
  let packageJsonPath: string;

  beforeEach(() => {
    environmentMap.clear();
    temporaryFolder = mkdtempSync(resolve(tmpdir(), 'generate-command-test-'));
    packageJsonPath = resolve(temporaryFolder, 'package.json');
    environmentMap.set('KIT_PROJECT_FOLDER', temporaryFolder);
    environmentMap.set('KIT_BADGES_FOLDER', temporaryFolder);
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    rmSync(temporaryFolder, { recursive: true });
    closeInstaller.close();
  });

  function toMockContext(args: string[]): Context {
    const context: Context = toContext(args);

    context.environment = createEnvironment({
      sources: [
        createMapSource(environmentMap),
        createProcessSource()
      ]
    });

    return context;
  };

  describe('ts-badges generate', () => {
    it('should generate badges from valid package.json', async () => {
      const packageJson = {
        name: "@test/my-package",
        version: "1.2.3",
        repository: {
          url: "https://github.com/test/my-package.git"
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');

      const context: Context = toMockContext(['generate']);
      doesNotThrow(async () => {
        await runMain(context);
      });
    });
  });

  describe('ts-badges generate with corrupt lcov', () => {
    it('should generate badges from valid package.json', async () => {
      const lcovReportPath:string = resolve(temporaryFolder, 'lcov.info');
      environmentMap.set('KIT_LCOV_REPORT_INDEX_PATH', lcovReportPath);
      writeFileSync(lcovReportPath, 'corrupted or unexpected content', 'utf8');
      const packageJson = {
        name: "@test/my-package",
        version: "1.2.3",
        repository: {
          url: "https://github.com/test/my-package.git"
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');

      const context: Context = toMockContext(['generate']);
      doesNotThrow(async () => {
        await runMain(context);
      });
    });
  });
});
