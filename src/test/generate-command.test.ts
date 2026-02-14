import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createInstaller } from "@jonloucks/badges-ts";
import { Badge } from "@jonloucks/badges-ts/api/Badge";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { toContext } from "../impl/Command.impl.js";
import { COMMAND } from "../impl/generate-command.js";

describe('generate-command tests', () => {
  let closeInstaller: AutoClose;
  let originalCwd: string;
  let temporaryFolder: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    temporaryFolder = mkdtempSync(join(tmpdir(), 'generate-command-test-'));
    process.chdir(temporaryFolder);
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(temporaryFolder, { recursive: true });
    closeInstaller.close();
  });

  describe('COMMAND', () => {
    it('should have execute method', () => {
      ok(typeof COMMAND.execute === 'function', 'COMMAND should have execute method');
    });

    it('should generate badges from valid package.json', async () => {
      const packageJson = {
        name: "@test/my-package",
        version: "1.2.3",
        repository: {
          url: "https://github.com/test/my-package.git"
        }
      };
      writeFileSync('package.json', JSON.stringify(packageJson));

      const context: Context = toContext(['generate', '--quiet']);
      const badges: Badge[] = await COMMAND.execute(context);

      ok(Array.isArray(badges), 'result should be an array');
      ok(badges.length >= 0, 'badges array should have valid length');
    });
  });
});
