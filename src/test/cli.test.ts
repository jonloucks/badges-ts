import { ok } from "node:assert";

import { main, runMain } from "../cli";
import { COMMAND as APPLY_VERSION_COMMAND } from "../impl/apply-version-command";
import { COMMAND as DISCOVER_COMMAND } from "../impl/discover-command";
import { COMMAND as GENERATE_COMMAND } from "../impl/generate-command";

const BANNER_START: string = "Badges-TS CLI - Version ";

describe('Main module', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let discoverExecuteSpy: jest.SpyInstance;
  let generateBadgesExecuteSpy: jest.SpyInstance;
  let applyVersionExecuteSpy: jest.SpyInstance;
  let originalArgv: string[];

  const mockProject = { name: 'test-project', version: '888.888.888' };
  const mockBadges = [{ name: 'coverage', outputPath: '/path/to/badge.svg' }];

  beforeEach(() => {
    originalArgv = process.argv;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    discoverExecuteSpy = jest.spyOn(DISCOVER_COMMAND, 'execute').mockResolvedValue(mockProject);
    generateBadgesExecuteSpy = jest.spyOn(GENERATE_COMMAND, 'execute').mockResolvedValue(mockBadges);
    applyVersionExecuteSpy = jest.spyOn(APPLY_VERSION_COMMAND, 'execute').mockResolvedValue(mockProject);
  });

  afterEach(() => {
    process.argv = originalArgv;
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    discoverExecuteSpy.mockRestore();
    generateBadgesExecuteSpy.mockRestore();
    applyVersionExecuteSpy.mockRestore();
  });

  describe('main function', () => {
    it('should have a main function', () => {
      ok(typeof main === 'function', 'main should be a function');
    });

    it('should execute discover command', async () => {
      await main(['discover']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should execute generate-badges command', async () => {
      await main(['generate-badges']);
      expect(generateBadgesExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should execute apply-version command', async () => {
      await main(['apply-version']);
      expect(applyVersionExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle discover command with flags', async () => {
      await main(['--verbose', 'discover', '--dry-run']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle generate-badges command with flags', async () => {
      await main(['--trace', 'generate-badges', '--quiet']);
      expect(generateBadgesExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle apply-version command with flags', async () => {
      await main(['-x', 'apply-version', '-d']);
      expect(applyVersionExecuteSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should show error and usage when no command provided', async () => {
      await main([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining(BANNER_START));
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should show error and usage when only flags provided', async () => {
      await main(['--verbose', '--dry-run']);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
    });

    it('should show error and usage for unknown command', async () => {
      await main(['unknown-command']);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining(BANNER_START));
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should handle case insensitive discover command', async () => {
      await main(['DISCOVER']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle case insensitive generate-badges command', async () => {
      await main(['Generate-Badges']);
      expect(generateBadgesExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle case insensitive apply-version command', async () => {
      await main(['Apply-Version']);
      expect(applyVersionExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from command', async () => {
      await main(['  discover  ']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findFirstNonFlag', () => {
    it('should find first non-flag argument', async () => {
      await main(['--verbose', 'discover', '--quiet']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when all args are flags', async () => {
      await main(['--verbose', '--warn', '-d']);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
    });

    it('should return undefined for empty array', async () => {
      await main([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
    });

    it('should find first non-flag even if multiple exist', async () => {
      await main(['--verbose', 'discover', 'extra-arg']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCommand', () => {
    it('should find discover command', async () => {
      await main(['discover']);
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should find generate-badges command', async () => {
      await main(['generate-badges']);
      expect(generateBadgesExecuteSpy).toHaveBeenCalledTimes(1);
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should find apply-version command', async () => {
      await main(['apply-version']);
      expect(applyVersionExecuteSpy).toHaveBeenCalledTimes(1);
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute version command with --version flag', async () => {
      await main(['--version']);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(BANNER_START)
      );
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute version command with -v flag', async () => {
      await main(['-v']);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(BANNER_START)
      );
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute version command with version keyword', async () => {
      await main(['version']);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(BANNER_START)
      );
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute help command with --help flag', async () => {
      await main(['--help']);
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(BANNER_START)
      );
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute help command with -h flag', async () => {
      await main(['-h']);
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(BANNER_START)
      );
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should execute help command with help keyword', async () => {
      await main(['help']);
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
      expect(discoverExecuteSpy).not.toHaveBeenCalled();
      expect(generateBadgesExecuteSpy).not.toHaveBeenCalled();
      expect(applyVersionExecuteSpy).not.toHaveBeenCalled();
    });

    it('should return undefined when no non-flag argument', async () => {
      await main(['--verbose', '-d']);
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
    });
  });

  describe('printUsage', () => {
    it('should print usage information', async () => {
      await main([]);
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining(BANNER_START));
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('discover'));
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('generate-badges'));
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('apply-version'));
    });

    it('should print usage for unknown command', async () => {
      await main(['help']);
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
    });

    it('should print usage when only flags provided', async () => {
      await main(['--verbose']);
      expect(consoleInfoSpy).toHaveBeenCalledWith('Usage:');
    });
  });

  describe('runMain', () => {
    it('should call main with process.argv sliced', async () => {
      process.argv = ['node', 'script', 'discover', '--verbose'];
      await runMain();
      expect(discoverExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle empty arguments', async () => {
      process.argv = ['node', 'script'];
      await runMain();
      expect(consoleErrorSpy).toHaveBeenCalledWith("No valid command found.");
    });
  });
});