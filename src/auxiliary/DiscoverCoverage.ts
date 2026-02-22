import { Coverage } from "@jonloucks/badges-ts/api/Coverage";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Contract } from "@jonloucks/contracts-ts/api/Contract";
import { create as createContract } from "@jonloucks/contracts-ts/api/RatifiedContract";
import { guardFunctions } from "@jonloucks/contracts-ts/api/Types";

/**
 * Interface for discovering code coverage information in a project. 
 * Implementations of this interface are responsible for analyzing the project and returning the code coverage percentage as a Coverage object. 
 * This contract is typically used in conjunction with other discovery commands to gather comprehensive information about the project, including its code coverage metrics.
 */
export interface DiscoverCoverage {

  /**
   * Discovers the code coverage information for the project. This method should analyze the project and return a Coverage object containing the percentage of code coverage.
   *
   * @param context The context in which the discovery is being performed, providing access to project-specific information and utilities.
   */
  discoverCoverage(context: Context): Promise<Coverage>;
}

/**
 * Determine if an instance implements DiscoverCoverage
 * @param instance the instance to check
 * @returns true if the instance implements DiscoverCoverage
 */
export function guard(instance: unknown): instance is DiscoverCoverage {
  return guardFunctions(instance, 'discoverCoverage');
}

/**
 * The DiscoverCoverage contract
 */
export const CONTRACT: Contract<DiscoverCoverage> = createContract({
  name: "DiscoverCoverage",
  test: guard
});