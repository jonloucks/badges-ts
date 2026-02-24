import { COMMAND as APPLY_VERSION_COMMAND } from "./impl/apply-version-command.js";
import { COMMAND as DISCOVER_COMMAND } from "./impl/discover-command.js";
import { COMMAND as GENERATE_COMMAND } from "./impl/generate-command.js";
import { COMMAND as COVERAGE_REPORT_COMMAND } from "./impl/coverage-report-command.js";
import { COMMAND as HELP_COMMAND } from "./impl/help-command.js";
import { COMMAND as VERSION_COMMAND } from "./impl/version-command.js";
import { COMMAND as COVERAGE_GATE_COMMAND } from "./impl/coverage-gate-command.js";

import { createInstaller } from "@jonloucks/badges-ts";
import { type Command, type Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { type AutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { isNotPresent } from '@jonloucks/contracts-ts/api/Types';

/**
 * Main entry point for the Badges CLI application. 
 * This function is responsible for parsing command-line arguments, 
 * determining which command to execute, and invoking the appropriate command logic. 
 * It also handles displaying usage information when no valid command is found.
 * 
 * @param args - The command-line arguments passed to the CLI, typically from process.argv.slice(2).
 * @returns A promise that resolves when the command execution is complete.
 * @throws An error if command execution fails or if no valid command is found.
 * 
 */
export async function runMain(context: Context): Promise<void> {
  const usingInstaller: AutoClose = createInstaller().open();
  try {
    await getCommand(context).execute(context);
  } finally {
    usingInstaller.close();
  }
}

function getCommand(context: Context): Command<unknown> {
  const firstNonFlag: string | undefined = findFirstCommand(context.arguments);
  if (isNotPresent(firstNonFlag)) {
    context.display.error("No valid command found.");
    return HELP_COMMAND;
  }

  switch (firstNonFlag.trim().toLowerCase()) {
    case 'discover': return DISCOVER_COMMAND;
    case 'generate': return GENERATE_COMMAND;
    case 'apply-version': return APPLY_VERSION_COMMAND;
    case 'coverage-report': return COVERAGE_REPORT_COMMAND;
    case 'coverage-gate': return COVERAGE_GATE_COMMAND;
    case 'version': return VERSION_COMMAND;
    case 'help': return HELP_COMMAND;
    default:
      context.display.error("No valid command found.");
      return HELP_COMMAND;
  }
}

function findFirstCommand(args: string[]): string | undefined {
  if (args.length === 0) {
    return undefined;
  }
  const front: string = args[0];
  if (front === '--help' || front === '-h') {
    return 'help';
  }
  if (front === '--version' || front === '-v') {
    return 'version';
  }
  return args.find(arg => !arg.startsWith('-'));
}