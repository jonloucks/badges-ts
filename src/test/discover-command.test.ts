import { ok, strictEqual } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createInstaller } from "@jonloucks/badges-ts";
import { Project } from "@jonloucks/badges-ts/api/Project";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { toContext } from "../impl/Command.impl.js";
import { COMMAND } from "../impl/discover-command.js";
import { createEnvironment, createMapSource, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";

describe('discover-command tests', () => {
  const environmentMap: Map<string, string> = new Map<string, string>();

  let closeInstaller: AutoClose;
  let originalCwd: string;
  let temporaryFolder: string;
  let packageJsonPath: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    temporaryFolder = mkdtempSync(join(tmpdir(), 'discover-command-test-'));
    packageJsonPath = join(temporaryFolder, 'package.json');
    environmentMap.set('KIT_PACKAGE_JSON_PATH', packageJsonPath);

    process.chdir(temporaryFolder);
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    process.chdir(originalCwd);
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

  describe('COMMAND', () => {
    it('should have execute method', () => {
      ok(typeof COMMAND.execute === 'function', 'COMMAND should have execute method');
    });

    it('should discover project from valid package.json', async () => {
      const packageJson = {
        name: "@test/my-package",
        version: "1.2.3",
        repository: {
          url: "https://github.com/test/my-package.git"
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');

      const context: Context = toMockContext(['discover']);
      const project: Project = await COMMAND.execute(context);

      ok(project !== null && project !== undefined, 'project should be returned');
      strictEqual(project.name, "@test/my-package", 'Project name should match');
    });
  });
});
