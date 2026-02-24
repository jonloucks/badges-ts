import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { VERSION } from "../version.js";

/**
 * Command implementation for displaying help information about the Badges-TS CLI.
 * This command provides usage instructions and details about available commands.
 */
export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running version command with: ${context.arguments.join(' ')}`);
    return new Promise<void>((resolve) => {
      context.display.info(`Badges-TS CLI - Version ${VERSION}`);
      resolve();
    });
  }
};