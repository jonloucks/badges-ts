export interface Command<T> {

  execute(context: Context): Promise<T>;

}

export interface Display {

  error(message: string): void;

  info(message: string): void;

  warn(message: string): void;

  trace(message: string): void;

  dry(message: string): void;
}

export interface Flags {

  dryRun: boolean;

  quiet: boolean;

  trace: boolean;

  warn: boolean;

  verbose: boolean;
}

export interface Context {

  arguments: string[];

  display: Display;

  flags: Flags;
}

export function toContext(args: string[]): Context {
  const flags: Flags = parseFlags({ args });
  const display: Display = toDisplay(flags);
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

function toDisplay(flags: Flags): Display {
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
