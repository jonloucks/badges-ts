import { COMMAND as APPLY_VERSION_COMMAND } from "./impl/apply-version-command";
import { COMMAND as DISCOVER_COMMAND } from "./impl/discover-command";
import { COMMAND as GENERATE_BADGES_COMMAND } from "./impl/generate-badges-command";

import { VERSION } from "./version";

import { createInstaller } from "@jonloucks/badges-ts";
import { AutoClose, isNotPresent, isPresent } from "@jonloucks/contracts-ts";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { Command, Context, toContext } from "impl/Command.impl";

async function main(): Promise<void> {
  using usingInstaller: AutoClose = createInstaller().open();
  used(usingInstaller);

  const context: Context = toContext(process.argv.slice(2));
  const command: Command<unknown> | undefined = getCommand(context);

  if (isPresent(command)) {
    await command.execute(context);
  } else {
    context.display.error("No valid command found.");
    printUsage(context);
  }
}

function getCommand(context: Context): Command<unknown> | undefined {
  const firstNonFlag: string | undefined = findFirstNonFlag(context.arguments);
  if (isNotPresent(firstNonFlag)) {
    return undefined;
  }

  switch (firstNonFlag.trim().toLowerCase()) {
    case 'discover': {
      return DISCOVER_COMMAND;
    }
    case 'generate-badges': {
      return GENERATE_BADGES_COMMAND;
    }
    case 'apply-version': {
      return APPLY_VERSION_COMMAND;
    }
    default:
      return undefined;
  }
}

function printUsage(context: Context): void {
  context.display.info(`Badges CLI - Version ${VERSION}`);
  context.display.info(`Usage:`);
  context.display.info(`  badges-cli detect-project     Detect project information from the current directory`);
  context.display.info(`  badges-cli generate-badges    Generate badges for the current project`);
  context.display.info(`  badges-cli apply-version      Apply version badges to the current project`);
}

function findFirstNonFlag(args: string[]): string | undefined {
  return args.find(arg => !arg.startsWith('-'));
}

main();
