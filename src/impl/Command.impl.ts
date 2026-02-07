import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";

export function toContext(args: string[]): Context {
  const flags: Flags = parseFlags({ args });
  const display: Display = flagsToDisplay(flags);
  return {
    arguments: args,
    display: display,
    flags: flags,
  };
}

function parseFlags({ args }: { args: string[]; }): Flags {
  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    quiet: args.includes('--quiet') || args.includes('-q'),
    trace: args.includes('--trace') || args.includes('-t'),
    warn: args.includes('--warn') || args.includes('-w'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

function flagsToDisplay(flags: Flags): Display {
  return {
    error: (message: string) : void => {
      if (!flags.quiet) {
        console.error(message);
      }
    },
    info: (message: string) : void => {
      if (!flags.quiet) {
        console.info(message);
      }
    },
    warn: (message: string) : void => {
      if (!flags.quiet && (flags.warn || flags.verbose)) {
        console.warn(message);
      }
    },
    trace: (message: string) : void => {
      if (!flags.quiet && (flags.trace || flags.verbose)) {
        console.info(message);
      }
    },
    dry: (message: string) : void => {
      if (!flags.quiet && flags.dryRun) {
        console.info(`[DRY RUN] ${message}`);
      }
    }
  };
}
