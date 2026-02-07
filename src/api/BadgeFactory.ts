import { Badge, Config as BadgeConfig } from "@jonloucks/badges-ts/api/Badge";
import { guardFunctions, RequiredType } from "./Types";
import { Contract, createContract } from "@jonloucks/contracts-ts";

/**
 * Interface for creating badges based on a configuration. 
 * Implementations of this interface are responsible for generating badges according to the
 * provided configuration and returning them as Badge instances.
 */
export interface BadgeFactory {

  /**
   * Creates a badge based on the provided configuration.
   * @param config - The configuration for the badge to be created.
   * @returns A Promise that resolves to a Badge instance representing the generated badge.
   */
  createBadge(config: BadgeConfig): Promise<Badge>;
}

/**
 * Determine if an instance implements BadgeFactory
 * 
 * @param instance the instance to check
 * @returns true if the instance implements BadgeFactory
 */
export function guard(instance: unknown): instance is RequiredType<BadgeFactory> {
  return guardFunctions(instance, 'createBadge');
}

/**
 * The BadgeFactory contract
 */
export const CONTRACT: Contract<BadgeFactory> = createContract({
  name: "BadgeFactory",
  test: guard
});