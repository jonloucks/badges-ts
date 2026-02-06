import { ok } from "node:assert";

import { toContext } from "../impl/Command.impl";

describe('Command tests', () => {

  describe('toContext', () => {
    it('should create context with empty arguments', () => {
      const context = toContext([]);
      ok(context.arguments.length === 0);
      ok(context.display);
      ok(context.flags);
    });

    it('should preserve arguments in context', () => {
      const args = ['command', 'arg1', 'arg2'];
      const context = toContext(args);
      ok(context.arguments === args);
      ok(context.arguments.length === 3);
    });
  });

  describe('parseFlags', () => {
    it('should parse --dry-run flag', () => {
      const context = toContext(['--dry-run']);
      ok(context.flags.dryRun === true);
    });

    it('should parse -d flag', () => {
      const context = toContext(['-d']);
      ok(context.flags.dryRun === true);
    });

    it('should parse --quiet flag', () => {
      const context = toContext(['--quiet']);
      ok(context.flags.quiet === true);
    });

    it('should parse -q flag', () => {
      const context = toContext(['-q']);
      ok(context.flags.quiet === true);
    });

    it('should parse --trace flag', () => {
      const context = toContext(['--trace']);
      ok(context.flags.trace === true);
    });

    it('should parse -t flag', () => {
      const context = toContext(['-t']);
      ok(context.flags.trace === true);
    });

    it('should parse --warn flag', () => {
      const context = toContext(['--warn']);
      ok(context.flags.warn === true);
    });

    it('should parse -w flag', () => {
      const context = toContext(['-w']);
      ok(context.flags.warn === true);
    });

    it('should parse --verbose flag', () => {
      const context = toContext(['--verbose']);
      ok(context.flags.verbose === true);
    });

    it('should parse -v flag', () => {
      const context = toContext(['-v']);
      ok(context.flags.verbose === true);
    });

    it('should parse multiple flags', () => {
      const context = toContext(['-d', '-q', '-v']);
      ok(context.flags.dryRun === true);
      ok(context.flags.quiet === true);
      ok(context.flags.verbose === true);
    });

    it('should default flags to false when not present', () => {
      const context = toContext([]);
      ok(context.flags.dryRun === false);
      ok(context.flags.quiet === false);
      ok(context.flags.trace === false);
      ok(context.flags.warn === false);
      ok(context.flags.verbose === false);
    });
  });

  describe('Display', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleInfoSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    describe('error', () => {
      it('should display error when not quiet', () => {
        const context = toContext([]);
        context.display.error('test error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
      });

      it('should not display error when quiet', () => {
        const context = toContext(['--quiet']);
        context.display.error('test error');
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should display info when not quiet', () => {
        const context = toContext([]);
        context.display.info('test info');
        expect(consoleInfoSpy).toHaveBeenCalledWith('test info');
      });

      it('should not display info when quiet', () => {
        const context = toContext(['--quiet']);
        context.display.info('test info');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should display warn when warn flag is set', () => {
        const context = toContext(['--warn']);
        context.display.warn('test warning');
        expect(consoleWarnSpy).toHaveBeenCalledWith('test warning');
      });

      it('should display warn when verbose flag is set', () => {
        const context = toContext(['--verbose']);
        context.display.warn('test warning');
        expect(consoleWarnSpy).toHaveBeenCalledWith('test warning');
      });

      it('should not display warn when no warn or verbose flag', () => {
        const context = toContext([]);
        context.display.warn('test warning');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should not display warn when quiet', () => {
        const context = toContext(['--quiet', '--warn']);
        context.display.warn('test warning');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('trace', () => {
      it('should display trace when trace flag is set', () => {
        const context = toContext(['--trace']);
        context.display.trace('test trace');
        expect(consoleInfoSpy).toHaveBeenCalledWith('test trace');
      });

      it('should display trace when verbose flag is set', () => {
        const context = toContext(['--verbose']);
        context.display.trace('test trace');
        expect(consoleInfoSpy).toHaveBeenCalledWith('test trace');
      });

      it('should not display trace when no trace or verbose flag', () => {
        const context = toContext([]);
        context.display.trace('test trace');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });

      it('should not display trace when quiet', () => {
        const context = toContext(['--quiet', '--trace']);
        context.display.trace('test trace');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });
    });

    describe('dry', () => {
      it('should display dry run message when dry-run flag is set', () => {
        const context = toContext(['--dry-run']);
        context.display.dry('test operation');
        expect(consoleInfoSpy).toHaveBeenCalledWith('[DRY RUN] test operation');
      });

      it('should not display dry run message when no dry-run flag', () => {
        const context = toContext([]);
        context.display.dry('test operation');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });

      it('should not display dry run message when quiet', () => {
        const context = toContext(['--quiet', '--dry-run']);
        context.display.dry('test operation');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });
    });
  });
});