import { Display, Flags, isPresent } from "@jonloucks/badges-ts/api/Types";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Environment } from "@jonloucks/variants-ts/api/Environment";
import { createEnvironment, createProcessSource, createRecordSource, Source } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { KIT_BADGES_CONFIG_PATH, KIT_PROJECT_FOLDER } from "@jonloucks/badges-ts/api/Variances";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export function toContext(args: string[]): Context {
  const flags: Flags = parseFlags({ args });
  const display: Display = flagsToDisplay(flags);
  const environment: Environment = toEnvironment(display);

  return {
    arguments: args,
    display: display,
    flags: flags,
    environment: environment,
  };
}

function parseFlags({ args }: { args: string[]; }): Flags {
  // possibly use environment variables in the future to set flags as well
  // environment.getVariance('KIT_DRY_RUN') === 'true' for example
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

function toEnvironment(display: Display): Environment {
  const processSource: Source = createProcessSource();
  const processEnvironment: Environment = createEnvironment({
    sources: [processSource]
  });
  const fileSource: Source | undefined = createFileSource(display, processEnvironment);
  if (isPresent(fileSource)) {
    return createEnvironment({
      sources: [processSource, fileSource]
    });
  } else {
    return processEnvironment;
  }
};

function createFileSource(display: Display, environment: Environment): Source | undefined {
  // in the future we could support multiple config files and merge them together, but for now we'll just support one
  // in the future we could check if file changes and reload the config, but for now we'll just read it once at startup
  const configFilePath: string = getFileSourcePath(environment);
  if (existsSync(configFilePath)) {
    try {
      const fileContents: string = readFileSync(configFilePath, "utf8");
      const record = JSON.parse(fileContents);
      return createRecordSource(record);
    } catch (error) {
      const cause:string = error instanceof Error ? error.message : String(error);
      const message = `Failed to read or parse config file at "${configFilePath}": ${cause}`;
      display.error(message);
      throw new Error(message);
    }
  }
  return undefined;
};

function getFileSourcePath(environment: Environment): string {
  const projectFolder: string = resolve(environment.getVariance(KIT_PROJECT_FOLDER));
  return resolve(projectFolder, environment.getVariance(KIT_BADGES_CONFIG_PATH));
}