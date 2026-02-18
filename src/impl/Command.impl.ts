import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Environment } from "@jonloucks/variants-ts/api/Environment";
import { createEnvironment, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";

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

function flagsToDisplay(flags: Flags): Display {
  const errorFn: (message: string) => void = flags.quiet ? () => {} : console.error;
  const infoFn: (message: string) => void = flags.quiet ? () => {} : console.info;
  const warnFn: (message: string) => void = (!flags.quiet && (flags.warn || flags.verbose)) ? console.warn : () => {};
  const traceFn: (message: string) => void = (!flags.quiet && (flags.trace || flags.verbose)) ? console.info : () => {};
  const dryFn: (message: string) => void = (!flags.quiet && flags.dryRun) ? (t: string) => console.info(`[DRY RUN] ${t}`) : () => {};
  return {
    error: errorFn,
    info: infoFn,
    warn: warnFn,
    trace: traceFn,
    dry: dryFn
  };
}
