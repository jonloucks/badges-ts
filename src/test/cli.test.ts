import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { ok } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { afterEach, beforeEach, describe, it, mock, Mock } from "node:test";
import { tmpdir } from "os";
import { resolve } from "path";
import { used } from "../auxiliary/Checks.js";
import { toContext } from "../impl/Command.impl.js";
import { createEnvironment, createMapSource, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";

const BANNER_START: string = "Badges-TS CLI - Version ";

describe('Main module', () => {
  const environmentMap: Map<string, string> = new Map<string, string>();
  let testDir: string;
  let mockErrorFn: Mock<(message: string) => void>;
  let mockInfoFn: Mock<(message: string) => void>;
  let mockWarnFn: Mock<(message: string) => void>;
  let mockTraceFn: Mock<(message: string) => void>;
  let mockDryFn: Mock<(message: string) => void>;

  beforeEach(() => {
    testDir = mkdtempSync(resolve(tmpdir(), 'cli-test-'));
    mkdirSync(resolve(testDir, 'src'));
    const summarySummaryPath: string = resolve(testDir, 'coverage-summary.json');
    const coverageJsonText = '{"total": {"lines":{"total":695,"covered":687,"skipped":0,"pct":98.84},"statements":{"total":713,"covered":704,"skipped":0,"pct":98.73},"functions":{"total":219,"covered":213,"skipped":0,"pct":97.26},"branches":{"total":170,"covered":163,"skipped":0,"pct":95.88},"branchesTrue":{"total":0,"covered":0,"skipped":0,"pct":100}}}';
    writeFileSync(summarySummaryPath, coverageJsonText, 'utf8');
    environmentMap.clear();
    environmentMap.set('KIT_BADGES_FOLDER', testDir);
    const templatePath: string = resolve(testDir, 'release-notes-template.md');
    environmentMap.set('KIT_COVERAGE_SUMMARY_PATH', summarySummaryPath);
    environmentMap.set('KIT_RELEASE_NOTES_TEMPLATE_PATH', templatePath);
    environmentMap.set('KIT_RELEASE_NOTES_OUTPUT_FOLDER', testDir);
    writeFileSync(templatePath, '# {{NAME}} v{{VERSION}}', 'utf8');

    mockErrorFn = mock.fn((message: string): void => {
      used(message);
    });
    mockInfoFn = mock.fn((message: string): void => {
      used(message);
    });
    mockWarnFn = mock.fn((message: string): void => {
      used(message);
    });
    mockTraceFn = mock.fn((message: string): void => {
      used(message);
    });
    mockDryFn = mock.fn((message: string): void => {
      used(message);
    });
  });

  afterEach(() => {
    environmentMap.clear();
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function toMockContext(args: string[]): Context {
    const context: Context = toContext(args);

    context.display.error = mockErrorFn;
    context.display.info = mockInfoFn;
    context.display.warn = mockWarnFn;
    context.display.trace = mockTraceFn;
    context.display.dry = mockDryFn;

    context.environment = createEnvironment({
      sources: [
        createMapSource(environmentMap),
        createProcessSource()
      ]
    });

    return context;
  };

  function assertInvalidCommand(): void {
    ok(mockErrorFn.mock.calls.find(call => call.arguments[0] === "No valid command found.") !== undefined, 'error should be called with "No valid command found."');
  };

  function assertHasBanner(): void {
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes(BANNER_START)) !== undefined, 'info should be called with banner');
  };

  function assertHasVersion(): void {
    return assertHasBanner(); // Version is included in banner, so this is sufficient to check for version output
  }

  function assertHasUsage(): void {
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('Usage:')) !== undefined, 'info should be called with usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('discover')) !== undefined, 'info should be called with discover command in usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('generate')) !== undefined, 'info should be called with generate command in usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('apply-version')) !== undefined, 'info should be called with apply-version command in usage');
  }

  function assertNoErrors(): void {
    ok(mockErrorFn.mock.calls.length === 0, 'error should not be called');
  }

  describe('main function', () => {
    it('should have a main function', () => {
      ok(typeof runMain === 'function', 'runMain should be a function');
    });

    it('should execute discover command', async () => {
      const context = toMockContext(['discover', '--quiet']);
      await runMain(context);
      assertNoErrors();
    });

    it('should execute generate command', async () => {
      const context = toMockContext(['generate']);
      await runMain(context);
      assertNoErrors();
    });

    it('should execute apply-version command', async () => {
      const context = toMockContext(['apply-version']);
      await runMain(context);
      assertNoErrors();
    });

    it('should handle discover command with flags', async () => {
      const context = toMockContext(['--verbose', 'discover', '--dry-run']);
      await runMain(context);
      assertNoErrors();
    });

    it('should handle generate command with flags', async () => {
      const context = toMockContext(['--trace', 'generate', '--quiet']);
      await runMain(context);
      assertNoErrors();
    });

    it('should handle apply-version command with flags', async () => {
      const context = toMockContext(['-x', 'apply-version', '-d']);
      await runMain(context);
      assertNoErrors();
    });

    it('should show error and usage when no command provided', async () => {
      const context = toMockContext([]);
      await runMain(context);
      assertInvalidCommand();
      assertHasBanner();
      assertHasUsage();
    });

    it('should show error and usage when only flags provided', async () => {
      const context = toMockContext(['--verbose', '--dry-run']);
      await runMain(context);
      assertInvalidCommand();
      assertHasBanner();
      assertHasUsage();
    });

    it('should show error and usage for unknown command', async () => {
      const context = toMockContext(['unknown-command']);
      await runMain(context);
      assertInvalidCommand();
      assertHasBanner();
      assertHasUsage();
    });

    it('should handle case insensitive discover command', async () => {
      const context = toMockContext(['DISCOVER']);
      await runMain(context);
      assertNoErrors();
    });

    it('should handle case insensitive generate command', async () => {
      const context = toMockContext(['Generate']);
      await runMain(context);
      assertNoErrors();
    });

    it('should handle case insensitive apply-version command', async () => {
      const context = toMockContext(['Apply-Version']);
      await runMain(context);
      assertNoErrors();
    });

    it('should trim whitespace from command', async () => {
      const context = toMockContext(['  discover  ']);
      await runMain(context);
      assertNoErrors();
    });
  });

  describe('findFirstNonFlag', () => {
    it('should find first non-flag argument', async () => {
      const context = toMockContext(['--verbose', 'discover', '--quiet']);
      await runMain(context);
      assertNoErrors();
    });

    it('should return undefined when all args are flags', async () => {
      const context = toMockContext(['--verbose', '--warn', '-d']);
      await runMain(context);
      assertInvalidCommand();
      assertHasBanner();
      assertHasUsage();
    });

    it('should return undefined for empty array', async () => {
      const context = toMockContext([]);
      await runMain(context);
      assertInvalidCommand();
      assertHasBanner();
      assertHasUsage();
    });

    it('should find first non-flag even if multiple exist', async () => {
      const context = toMockContext(['--verbose', 'discover', 'extra-arg']);
      await runMain(context);
      assertNoErrors();
    });
  });

  describe('findCommand', () => {
    it('should find discover command', async () => {
      const context = toMockContext(['discover']);
      await runMain(context);
      assertNoErrors();
    });

    it('should find generate command', async () => {
      const context = toMockContext(['generate']);
      await runMain(context);
      assertNoErrors();
    });

    it('should find apply-version command', async () => {
      const context = toMockContext(['apply-version']);
      await runMain(context);
      assertNoErrors();
    });

    it('should execute version command with --version flag', async () => {
      const context = toMockContext(['--version']);
      await runMain(context);
      assertNoErrors();
      assertHasVersion();
    });

    it('should execute version command with -v flag', async () => {
      const context = toMockContext(['-v']);
      await runMain(context);
      assertNoErrors();
      assertHasVersion();
    });

    it('should execute version command with version keyword', async () => {
      const context = toMockContext(['version']);
      await runMain(context);
      assertNoErrors();
      assertHasVersion();
    });

    it('should execute help command with --help flag', async () => {
      const context = toMockContext(['--help']);
      await runMain(context);
      assertNoErrors();
      assertHasUsage();
    });

    it('should execute help command with -h flag', async () => {
      const context = toMockContext(['-h']);
      await runMain(context);
      assertNoErrors();
      assertHasUsage();
    });

    it('should execute help command with help keyword', async () => {
      const context = toMockContext(['help']);
      await runMain(context);
      assertNoErrors();
      assertHasUsage();
    });

    it('should return undefined when no non-flag argument', async () => {
      const context = toMockContext(['--verbose', '-d']);
      await runMain(context);
      assertInvalidCommand();
    });
  });

  describe('printUsage', () => {
    it('should print usage information', async () => {
      const context = toMockContext([]);
      await runMain(context);
      // assertNoErrors();
      assertHasBanner();
      assertHasUsage();
    });

    it('should print usage for unknown command', async () => {
      const context = toMockContext(['help']);
      await runMain(context);
      // expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
    });

    it('should print usage when only flags provided', async () => {
      const context = toMockContext(['--verbose']);
      await runMain(context);
      // expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
    });
  });

  // describe('runMain', () => {
  //   it('should call main with process.argv sliced', async () => {
  //     process.argv = ['node', 'script', 'discover', '--verbose'];
  //     await runMain();
  //     // expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
  //   });

  //   it('should handle empty arguments', async () => {
  //     process.argv = ['node', 'script'];
  //     await runMain();
  //     // expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
  //   });
  // });
});

