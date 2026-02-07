import { Project } from "@jonloucks/badges-ts/api/Project";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";

/**
 * Discovers the project information such as name and version. 
 * This command is typically used as a prerequisite for other commands that need project information to function correctly.
 * It relies on the DiscoverProject contract to gather the necessary details about the project.
 */
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

