import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

import { createInstaller } from "@jonloucks/badges-ts";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose } from "@jonloucks/contracts-ts";
import { toContext } from "../impl/Command.impl";
import { COMMAND } from "../impl/generate-command";

describe('generate-command tests', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;
  let closeInstaller: AutoClose;

  const makeTempDir = (): string => mkdtempSync(join(tmpdir(), 'badges-ts-'));

  const writeTemplate = (path: string): void => {
    const template = `<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}-{{UNKNOWN}}</svg>`;
    writeFileSync(path, template, 'utf8');
  };

  const writeCoverageSummary = (path: string, pct: number): void => {
    const json = {
      total: {
        lines: { pct }
      }
    };
    writeFileSync(path, JSON.stringify(json), 'utf8');
  };

  const setEnvPaths = (baseDir: string, options?: { trim?: boolean; }): {
    templatePath: string;
    coveragePath: string;
    coverageBadgePath: string;
    typedocBadgePath: string;
    npmBadgePath: string;
  } => {
    const templatePath = resolve(baseDir, 'template.svg');
    const coveragePath = resolve(baseDir, 'coverage-summary.json');
    const coverageBadgePath = resolve(baseDir, 'coverage-badge.svg');
    const typedocBadgePath = resolve(baseDir, 'typedoc-badge.svg');
    const npmBadgePath = resolve(baseDir, 'npm-badge.svg');

    const maybeTrim = (value: string): string => options?.trim ? `  ${value}  ` : value;

    process.env.KIT_TEMPLATE_BADGE_PATH = maybeTrim(templatePath);
    process.env.KIT_COVERAGE_SUMMARY_PATH = maybeTrim(coveragePath);
    process.env.KIT_COVERAGE_SUMMARY_BADGE_PATH = maybeTrim(coverageBadgePath);
    process.env.KIT_TYPEDOC_BADGE_PATH = maybeTrim(typedocBadgePath);
    process.env.KIT_NPM_BADGE_PATH = maybeTrim(npmBadgePath);

    return { templatePath, coveragePath, coverageBadgePath, typedocBadgePath, npmBadgePath };
  };

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    closeInstaller = createInstaller().open();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleWarnSpy.mockRestore();
    closeInstaller.close();
  });

  it('should generate all badges with template replacements', async () => {
    const baseDir = makeTempDir();
    const paths = setEnvPaths(baseDir);

    writeTemplate(paths.templatePath);
    writeCoverageSummary(paths.coveragePath, 96);

    const context: Context = toContext(['generate', '--quiet']);
    const badges = await COMMAND.execute(context);

    expect(badges).toHaveLength(3);

    const coverageContent = readFileSync(paths.coverageBadgePath, 'utf8');
    const typedocContent = readFileSync(paths.typedocBadgePath, 'utf8');
    const npmContent = readFileSync(paths.npmBadgePath, 'utf8');

    expect(coverageContent).toContain('coverage');
    expect(coverageContent).toContain('96%');
    expect(coverageContent).toContain('#4bc124');
    expect(coverageContent).toContain('{{UNKNOWN}}');

    expect(typedocContent).toContain('typedoc');
    expect(typedocContent).toContain('100%');

    expect(npmContent).toContain('npm');
  });

  it('should select badge color based on coverage percentage', async () => {
    const cases: Array<{ pct: number; color: string; }> = [
      { pct: 95, color: '#4bc124' },
      { pct: 80, color: 'yellowgreen' },
      { pct: 65, color: 'yellow' },
      { pct: 45, color: 'orange' },
      { pct: 10, color: 'red' }
    ];

    for (const testCase of cases) {
      const baseDir = makeTempDir();
      const paths = setEnvPaths(baseDir);

      writeTemplate(paths.templatePath);
      writeCoverageSummary(paths.coveragePath, testCase.pct);

      const context: Context = toContext(['generate', '--quiet']);
      await COMMAND.execute(context);

      const coverageContent = readFileSync(paths.coverageBadgePath, 'utf8');
      expect(coverageContent).toContain(testCase.color);

      rmSync(baseDir, { recursive: true, force: true });
    }
  });

  it('should warn when coverage summary is missing and still return other badges', async () => {
    const baseDir = makeTempDir();
    const paths = setEnvPaths(baseDir);

    writeTemplate(paths.templatePath);
    // Intentionally do NOT create coverage summary file

    const context: Context = toContext(['generate', '--warn']);
    const badges = await COMMAND.execute(context);

    expect(badges).toHaveLength(2);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unable to generate coverage summary badge')
    );

    expect(existsSync(paths.npmBadgePath)).toBe(true);
    expect(existsSync(paths.typedocBadgePath)).toBe(true);
  });

  it('should trim environment variable paths', async () => {
    const baseDir = makeTempDir();
    const paths = setEnvPaths(baseDir, { trim: true });

    writeTemplate(paths.templatePath);
    writeCoverageSummary(paths.coveragePath, 75);

    const context: Context = toContext(['generate', '--quiet']);
    await COMMAND.execute(context);

    expect(existsSync(paths.coverageBadgePath)).toBe(true);
    expect(existsSync(paths.typedocBadgePath)).toBe(true);
    expect(existsSync(paths.npmBadgePath)).toBe(true);
  });

  it('should generate badges using default paths when env vars are unset', async () => {
    delete process.env.KIT_TEMPLATE_BADGE_PATH;
    delete process.env.KIT_COVERAGE_SUMMARY_PATH;
    delete process.env.KIT_COVERAGE_SUMMARY_BADGE_PATH;
    delete process.env.KIT_TYPEDOC_BADGE_PATH;
    delete process.env.KIT_NPM_BADGE_PATH;

    const context: Context = toContext(['generate', '--quiet']);
    const badges = await COMMAND.execute(context);

    expect(badges.length).toBeGreaterThan(0);
  });
});