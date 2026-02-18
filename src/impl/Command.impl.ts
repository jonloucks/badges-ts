import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Environment } from "@jonloucks/variants-ts/api/Environment";
import { createEnvironment, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";

export function toContext(args: string[]): Context {
  const flags: Flags = parseFlags({ args });
  const display: Display = flagsToDisplay(flags);

  // add load from configuration file
  const environment: Environment = createEnvironment({
    sources: [
      createProcessSource()
    ]
  });
  return {
    arguments: args,
    display: display,
    flags: flags,
    environment: environment,
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

const DISCARD = (message: string): void => { used(message); };
const DRY_RUN = (message: string): void => console.info(`[DRY RUN] ${message}`);

function flagsToDisplay(flags: Flags): Display {
  return {
    error: flags.quiet ? DISCARD : console.error,
    info: flags.quiet ? DISCARD : console.info,
    warn: flags.quiet || !(flags.warn || flags.verbose) ? DISCARD : console.warn,
    trace: flags.quiet || !(flags.trace || flags.verbose) ? DISCARD : console.info,
    dry: flags.quiet || !(flags.dryRun) ? DISCARD : DRY_RUN
  };
}
