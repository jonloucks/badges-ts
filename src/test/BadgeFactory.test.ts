import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { ok, strictEqual } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { tmpdir } from "os";
import { join } from "path";

import { Badge, Config as BadgeConfig } from "@jonloucks/badges-ts/api/Badge";
import { BadgeFactory, CONTRACT as BADGE_FACTORY, guard } from "@jonloucks/badges-ts/api/BadgeFactory";
import { Flags, isPresent } from "@jonloucks/badges-ts/api/Types";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { createInstaller } from "@jonloucks/badges-ts";
import { assertContract, assertGuard } from "./helper.test.js";

assertGuard(guard, "createBadge");

assertContract(BADGE_FACTORY, "BadgeFactory");

describe('BadgeFactory tests', () => {
  let closeInstaller: AutoClose;
  let badgeFactory: BadgeFactory;
  let temporaryFolder: string;
  let templatePath: string;
  let outputPath: string;

  const testFlags: Flags = {
    dryRun: false,
    quiet: false,
    trace: false,
    warn: false,
    verbose: false
  };

  const makeTempDir = (): string => mkdtempSync(join(tmpdir(), 'badge-factory-'));

  const writeTemplate = (path: string, content: string = '<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}</svg>'): void => {
    writeFileSync(path, content, 'utf8');
  };

  beforeEach(() => {
    closeInstaller = createInstaller().open();
    badgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
    temporaryFolder = makeTempDir();
    templatePath = join(temporaryFolder, 'template.svg');
    outputPath = join(temporaryFolder, 'output.svg');
  });

  afterEach(() => {
    closeInstaller.close();
    if (existsSync(temporaryFolder)) {
      rmSync(temporaryFolder, { recursive: true, force: true });
    }
  });

  describe('createBadge', () => {
    it('should create a badge with placeholders', async () => {
      writeTemplate(templatePath);

      const config: BadgeConfig = {
        name: 'test-badge',
        templatePath,
        outputPath,
        label: 'coverage',
        value: '95%',
        color: '#4bc124',
        flags: testFlags,
        display: {
          trace: () => { },
          info: () => { },
          warn: () => { },
          error: () => { },
          dry: () => { }
        }
      };

      const badge: Badge = await badgeFactory.createBadge(config);

      ok(badge !== null && badge !== undefined, 'badge should be created');
      strictEqual(badge.name, 'test-badge', 'badge name should match');
      ok(existsSync(outputPath), 'output file should exist');

      const content = readFileSync(outputPath, 'utf8');
      ok(content.includes('coverage'), 'content should include label');
    });

        it('should not create a badge with --dry-run', async () => {
      writeTemplate(templatePath);
          testFlags.dryRun = true;
      const config: BadgeConfig = {
        name: 'test-badge',
        templatePath,
        outputPath,
        label: 'coverage',
        value: '95%',
        color: '#4bc124',
        flags: testFlags,
        display: {
          trace: () => { },
          info: () => { },
          warn: () => { },
          error: () => { },
          dry: () => { }
        }
      };

      const badge: Badge = await badgeFactory.createBadge(config);
      ok(!existsSync(outputPath), 'output file should not exist');

      ok(isPresent(badge), 'badge should be created');
    });
  });
});
