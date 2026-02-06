import { Project } from "@jonloucks/badges-ts/api/Project";
import { RequiredType, guardFunctions } from "@jonloucks/contracts-ts/api/Types";
import { Contract, createContract } from "@jonloucks/contracts-ts";

/**
 * Interface for discovering project information
 */
export interface DiscoverProject {

  /**
   * Discover project information from the current environment
   * 
   * @returns a Promise that resolves to a Project
   */
  discoverProject(): Promise<Project>;
}

/**
 * Determine if an instance implements DiscoverProject
 * 
 * @param instance the instance to check
 * @returns true if the instance implements DiscoverProject
 */
export function guard(instance: unknown): instance is RequiredType<DiscoverProject> {
  return guardFunctions(instance, 'discoverProject');
}

/**
 * The DiscoverProject contract
 */
export const CONTRACT: Contract<DiscoverProject> = createContract({
  name: "DiscoverProject",
  test: guard
});