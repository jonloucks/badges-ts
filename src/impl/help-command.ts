import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { VERSION } from "../version.js";

/**
 * Command implementation for displaying help information about the Badges-TS CLI.
 * This command provides usage instructions and details about available commands.
 */
export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running help command with: ${context.arguments.join(' ')}`);
    return new Promise<void>((resolve) => {
      context.display.info(`Badges-TS CLI - Version ${VERSION}`);

      context.display.info(`Usage:`);
      context.display.info(`  badges-ts discover            Detect project information from the current directory`);
      context.display.info(`  badges-ts generate            Generate badges for the current project`);
      context.display.info(`  badges-ts apply-version       Apply version badges to the current project`);
      context.display.info(`  badges-ts version             Display the current version of the CLI`);
      context.display.info(`  badges-ts coverage-report     Generate a code coverage report based on discovered coverage information`);
      context.display.info(`  badges-ts coverage-gate       Check if code coverage meets a specified gate threshold`);
      context.display.info(`    --required-coverage=<value>   Specify the required code coverage percentage for the gate (default: 0)`);
      context.display.info(`  badges-ts help                Display this help message`);

      resolve();
    });
  }
};