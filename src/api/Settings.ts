import { Contract, createContract } from "@jonloucks/contracts-ts";
import { guardFunctions, RequiredType } from "@jonloucks/contracts-ts/api/Types";

/**
 * Interface for settings used across commands
 */
export interface Settings {

  get verbose(): boolean;

  get dryRun(): boolean;

  get autoCreateFolders(): boolean;
}

/**
 * Determine if an instance implements Settings
 * 
 * @param instance the instance to check
 * @returns true if the instance implements Settings
 */
export function guard(instance: unknown): instance is RequiredType<Settings> {
  return guardFunctions(instance, 'verbose', 'dryRun', 'autoCreateFolders');
}

/**
 * The Settings contract
 */
export const CONTRACT: Contract<Settings> = createContract({
  name: "Settings",
  test: guard,
  replaceable: true
});