import { Project } from "@jonloucks/badges-ts/api/Project";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Command, Context } from "./Command.impl";

export const COMMAND: Command<Project> = {
  execute: async function (context: Context): Promise<Project> {
    context.display.trace(`Running discover-project with: ${context.arguments.join(' ')}`);
    return CONTRACTS.enforce(DISCOVER_PROJECT).discoverProject().then((project) => {
      context.display.info(`Discovered project: ${project.name}, version: ${project.version}`);
      return project;
    }).catch((error: Error) => {
      context.display.error(`Error during project detection: ${error.message}`);
      throw error;
    });
  }
};

