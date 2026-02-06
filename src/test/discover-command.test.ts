import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { ok, rejects, strictEqual } from "node:assert";
import { tmpdir } from "os";
import { join } from "path";

import { createInstaller } from "@jonloucks/badges-ts";
import { Project } from "@jonloucks/badges-ts/api/Project";
import { AutoClose } from "@jonloucks/contracts-ts";
import { Context, toContext } from "../impl/Command.impl";
import { COMMAND } from "../impl/discover-command";

describe('discover command', () => {
  let closeInstaller: AutoClose;
  let context: Context;
  let originalCwd: string;
  let testDir: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'discover-command-test-'));
    process.chdir(testDir);
    closeInstaller = createInstaller().open();
    context = toContext(['discover', '--quiet']);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true });
    closeInstaller.close();
  });

  it('should successfully discover project from valid package.json', async () => {
    const packageJson = {
      name: "@test/my-package",
      version: "1.2.3",
      repository: {
        url: "https://github.com/test/my-package.git"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project: Project = await COMMAND.execute(context);

    strictEqual(project.name, "@test/my-package", 'Project name should match');
    strictEqual(project.version, "1.2.3", 'Project version should match');
    ok(project.repository, 'Project should have repository');
    strictEqual(project.repository, "https://github.com/test/my-package", 'Repository URL should be normalized');
  });

  it('should discover project with minimal package.json (no repository)', async () => {
    const packageJson = {
      name: "simple-package",
      version: "0.0.1"
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.name, "simple-package", 'Project name should match');
    strictEqual(project.version, "0.0.1", 'Project version should match');
    strictEqual(project.repository, undefined, 'Project should not have repository');
  });

  it('should trim whitespace from name and version', async () => {
    const packageJson = {
      name: "  padded-package  ",
      version: "  2.0.0  ",
      repository: {
        url: "https://example.com"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.name, "padded-package", 'Project name should be trimmed');
    strictEqual(project.version, "2.0.0", 'Project version should be trimmed');
  });

  it('should normalize repository URL by removing .git suffix', async () => {
    const packageJson = {
      name: "git-package",
      version: "1.0.0",
      repository: {
        url: "https://github.com/test/repo.git"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.repository, "https://github.com/test/repo", 'Repository URL should have .git removed');
  });

  it('should normalize repository URL by removing git+ prefix', async () => {
    const packageJson = {
      name: "git-prefix-package",
      version: "1.0.0",
      repository: {
        url: "git+https://github.com/test/repo"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.repository, "https://github.com/test/repo", 'Repository URL should have git+ prefix removed');
  });

  it('should normalize repository URL by removing both git+ prefix and .git suffix', async () => {
    const packageJson = {
      name: "complex-repo-package",
      version: "1.0.0",
      repository: {
        url: "git+https://github.com/test/repo.git"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    const project = await COMMAND.execute(context);

    strictEqual(project.repository, "https://github.com/test/repo", 'Repository URL should be fully normalized');
  });

  it('should return undefined for repository when URL is undefined', async () => {
    const packageJson = {
      name: "no-url-package",
      version: "1.0.0",
      repository: {
        url: undefined
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.repository, undefined, `Repository URL should be undefined when URL is undefined, but ${project.repository} was returned`);
  });

  it('should reject when package.json does not exist', async () => {
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when package.json is invalid JSON', async () => {
    writeFileSync('package.json', 'invalid json {');
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when package.json is missing name', async () => {
    const packageJson = {
      version: "1.0.0"
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when package.json is missing version', async () => {
    const packageJson = {
      name: "no-version-package"
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when name is empty string', async () => {
    const packageJson = {
      name: "",
      version: "1.0.0"
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when version is empty string', async () => {
    const packageJson = {
      name: "empty-version-package",
      version: ""
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when name is only whitespace', async () => {
    const packageJson = {
      name: "   ",
      version: "1.0.0"
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should reject when version is only whitespace', async () => {
    const packageJson = {
      name: "whitespace-version-package",
      version: "   "
    };
    writeFileSync('package.json', JSON.stringify(packageJson));
    await rejects(() => COMMAND.execute(context));
  });

  it('should handle repository with only .git suffix', async () => {
    const packageJson = {
      name: "repo-package",
      version: "1.0.0",
      repository: {
        url: ".git"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.repository, "", 'Repository URL should be empty string after removing .git');
  });

  it('should handle repository with only git+ prefix', async () => {
    const packageJson = {
      name: "prefix-package",
      version: "1.0.0",
      repository: {
        url: "git+"
      }
    };
    writeFileSync('package.json', JSON.stringify(packageJson));

    const project = await COMMAND.execute(context);

    strictEqual(project.repository, "", 'Repository URL should be empty string after removing git+');
  });
});
