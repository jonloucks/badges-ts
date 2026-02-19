import { existsSync, readFileSync, writeFileSync } from "fs";
import { ok, strictEqual } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { resolve } from "path";

import { Badge, Config as BadgeConfig } from "@jonloucks/badges-ts/api/Badge";
import { BadgeFactory, CONTRACT as BADGE_FACTORY, guard } from "@jonloucks/badges-ts/api/BadgeFactory";
import { isPresent } from "@jonloucks/badges-ts/api/Types";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { createInstaller } from "@jonloucks/badges-ts";
import { assertContract, assertGuard } from "./helper.test.js";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";

assertGuard(guard, "createBadge");

assertContract(BADGE_FACTORY, "BadgeFactory");

describe('BadgeFactory tests', () => {
  let sandbox: Sandbox;
  let closeSandbox: AutoClose;
  let closeInstaller: AutoClose;
  let badgeFactory: BadgeFactory;
  let templatePath: string;
  let outputPath: string;

  beforeEach(() => {
    sandbox = createSandbox();
    closeSandbox = sandbox.open();
    closeInstaller = createInstaller().open();
    badgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
    templatePath = resolve(sandbox.folder, 'template.svg');
    outputPath = resolve(sandbox.folder, 'output.svg');
  });

  afterEach(() => {
    closeInstaller.close();
    closeSandbox.close();
  });

  const writeTemplate = (path: string, content: string): void => {
    writeFileSync(path, content, 'utf8');
  };

  const createBadgeConfig = (context: Context): BadgeConfig => ({
    name: 'test-badge',
    templatePath,
    outputPath,
    label: 'coverage',
    value: '95%',
    color: '#4bc124',
    flags: context.flags,
    display: context.display
  });

  describe('createBadge', () => {
    it('should create a badge with placeholders', async () => {
      writeTemplate(templatePath, '<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}</svg>');
      const context: Context = sandbox.toContext([]);
      const badge: Badge = await badgeFactory.createBadge(createBadgeConfig(context));

      ok(badge !== null && badge !== undefined, 'badge should be created');
      strictEqual(badge.name, 'test-badge', 'badge name should match');
      ok(existsSync(outputPath), 'output file should exist');

      const content = readFileSync(outputPath, 'utf8');
      ok(content.includes('coverage'), 'content should include label');
    });

    it('should not create a badge with --dry-run', async () => {
      writeTemplate(templatePath, '<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}</svg>');
      const context: Context = sandbox.toContext(['--dry-run']);
      const badge: Badge = await badgeFactory.createBadge(createBadgeConfig(context));
      ok(!existsSync(outputPath), 'output file should not exist');
      ok(isPresent(badge), 'badge should be created');
    });

    it('with junk template file', async () => {
      writeTemplate(templatePath, 'Junk, {{UNKNOWN}}');
      const context: Context = sandbox.toContext([]);
      const badge: Badge = await badgeFactory.createBadge(createBadgeConfig(context));

      ok(badge !== null && badge !== undefined, 'badge should be created');
      strictEqual(badge.name, 'test-badge', 'badge name should match');
      ok(existsSync(outputPath), 'output file should exist');

      const content = readFileSync(outputPath, 'utf8');
      ok(content.includes('Junk'), 'existing content should be preserved');
    });

    it('with missing template file', async () => {
      const context: Context = sandbox.toContext([]);
      await badgeFactory.createBadge(createBadgeConfig(context))
        .catch((err) => {
          ok(err instanceof Error, 'should throw an error');
          ok(err.message.includes('ENOENT'), 'error message should indicate missing file');
        });
    });
  });
});
