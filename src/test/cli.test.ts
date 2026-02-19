import { AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { runMain } from "@jonloucks/badges-ts/cli";
import { ok } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { create as createSandbox, Sandbox } from "./Sandbox.test.js";

const BANNER_START: string = "Badges-TS CLI - Version ";

describe('Main module', () => {
  let sandbox: Sandbox;
  let closeSandbox: AutoClose;

  beforeEach(() => {
    sandbox = createSandbox();
    closeSandbox = sandbox.open();
  });

  afterEach(() => {
    closeSandbox.close();
  });

  function toMockContext(args: string[]): Context {
    return sandbox.toContext(args);
  };

  function assertInvalidCommand(): void {
    const mockErrorFn = sandbox.getLog('error');
    ok(mockErrorFn.mock.calls.find(call => call.arguments[0] === "No valid command found.") !== undefined, 'error should be called with "No valid command found."');
  };

  function assertHasBanner(): void {
    const mockInfoFn = sandbox.getLog('info');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes(BANNER_START)) !== undefined, 'info should be called with banner');
  };

  function assertHasVersion(): void {
    return assertHasBanner(); // Version is included in banner, so this is sufficient to check for version output
  }

  function assertHasUsage(): void {
    const mockInfoFn = sandbox.getLog('info');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('Usage:')) !== undefined, 'info should be called with usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('discover')) !== undefined, 'info should be called with discover command in usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('generate')) !== undefined, 'info should be called with generate command in usage');
    ok(mockInfoFn.mock.calls.find(call => call.arguments[0].includes('apply-version')) !== undefined, 'info should be called with apply-version command in usage');
  }

  function assertNoErrors(): void {
    const mockErrorFn = sandbox.getLog('error');
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
});

