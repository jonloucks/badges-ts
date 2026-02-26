import { Project } from "@jonloucks/badges-ts/api/Project";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACT as DISCOVER_COVERAGE } from "@jonloucks/badges-ts/auxiliary/DiscoverCoverage";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Coverage } from "@jonloucks/badges-ts/api/Coverage";
import { Internal } from "./Internal.impl.js";

/**
 * Discovers the project information (such as name and version) and code coverage.
 * This command is typically used as a prerequisite for other commands that need project metadata
 * and/or coverage information to function correctly.
 * It relies on the DiscoverProject and DiscoverCoverage contracts to gather the necessary details.
 */
export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running discover with: ${context.arguments.join(' ')}`);
    await Promise.all([
      discoverProject(context),
      discoverCoverage(context)
    ]);
  }
};

async function discoverProject(context: Context): Promise<Project | undefined> {
  return CONTRACTS.enforce(DISCOVER_PROJECT).discoverProject(context)
    .then((project) => {
      context.display.info(`Discovered project: ${project.name}, version: ${project.version}`);
      return project;
    }).catch((error: Error) => {
      context.display.error(error instanceof Error ? error.message : String(error));
      return undefined;
    });
}

async function discoverCoverage(context: Context): Promise<Coverage | undefined> {
  return CONTRACTS.enforce(DISCOVER_COVERAGE).discoverCoverage(context)
    .then((coverage) => {
      context.display.info(`Discovered code coverage: ${Internal.formatPercent(coverage.percentage)}`);
      return coverage;
    }).catch((error: Error) => {
      context.display.error(error instanceof Error ? error.message : String(error));
      return undefined;
    });
}

