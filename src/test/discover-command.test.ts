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

describe('discover-command tests', () => {
  let closeInstaller: AutoClose;
  let originalCwd: string;
  let testDir: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'discover-command-test-'));
    process.chdir(testDir);
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true });
    closeInstaller.close();
  });

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
      writeFileSync('package.json', JSON.stringify(packageJson));

      const context: Context = toContext(['discover', '--quiet']);
      const project: Project = await COMMAND.execute(context);

      ok(project !== null && project !== undefined, 'project should be returned');
      strictEqual(project.name, "@test/my-package", 'Project name should match');
    });
  });
});
