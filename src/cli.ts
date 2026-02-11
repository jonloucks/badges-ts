#!/usr/bin/env node
import { COMMAND as APPLY_VERSION_COMMAND } from "./impl/apply-version-command";
import { COMMAND as DISCOVER_COMMAND } from "./impl/discover-command";
import { COMMAND as GENERATE_COMMAND } from "./impl/generate-command";

import { VERSION } from "./version";

import { createInstaller } from "@jonloucks/badges-ts";
import { AutoClose, isNotPresent, isPresent } from "@jonloucks/contracts-ts";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { toContext } from "./impl/Command.impl";

/**
 * Main entry point for the Badges CLI application. 
 * This function is responsible for parsing command-line arguments, 
 * determining which command to execute, and invoking the appropriate command logic. 
 * It also handles displaying usage information when no valid command is found.
 * 
 * @param args - The command-line arguments passed to the CLI, typically from process.argv.slice(2).
 * @returns A promise that resolves when the command execution is complete.
 * @throws An error if command execution fails or if no valid command is found.
 */
export async function main(args: string[]): Promise<void> {
  using usingInstaller: AutoClose = createInstaller().open();
  used(usingInstaller);

  const context: Context = toContext(args);
  const command: Command<unknown> | undefined = findCommand(context);

  if (isPresent(command)) {
    await command.execute(context);
  } else {
    context.display.error("No valid command found.");
    printUsage(context);
  }
}

function findCommand(context: Context): Command<unknown> | undefined {
  if (context.arguments.length === 0) {
    return undefined;
  }
  const firstNonFlag: string | undefined = findFirstCommand(context.arguments);
  if (isNotPresent(firstNonFlag)) {
    return undefined;
  }

  switch (firstNonFlag.trim().toLowerCase()) {
    case 'discover': {
      return DISCOVER_COMMAND;
    }
    case 'generate':
    case 'generate-badges': {
      return GENERATE_COMMAND;
    }
    case 'apply-version': {
      return APPLY_VERSION_COMMAND;
    }
    case 'version': {
      return {
        execute: async (context: Context): Promise<string> => {
          printBanner(context);
          return VERSION;
        }
      };
    }
    case 'help': {
      return {
        execute: async (context: Context): Promise<void> => {
          printUsage(context);
        }
      };
    }
    default:
      return undefined;
  }
}

function printBanner(context: Context): void {
  context.display.info(`Badges-TS CLI - Version ${VERSION}`);
}

function printUsage(context: Context): void {
  printBanner(context);
  context.display.info(`Usage:`);
  context.display.info(`  badges-ts discover           Detect project information from the current directory`);
  context.display.info(`  badges-ts generate           Generate badges for the current project`);
  context.display.info(`  badges-ts generate-badges    (deprecated) Alias for "generate"`);
  context.display.info(`  badges-ts apply-version      Apply version badges to the current project`);
}

function findFirstCommand(args: string[]): string | undefined {
  const front: string = args[0];
  if (front === '--help' || front === '-h') {
    return 'help';
  }
  if (front === '--version' || front === '-v') {
    return 'version';
  }
  return args.find(arg => !arg.startsWith('-'));
}

export async function runMain(): Promise<void> {
  return await main(process.argv.slice(2));
}

/* istanbul ignore next */
// Only run main if the file is executed directly
if (require.main === module) {
  runMain();
}
