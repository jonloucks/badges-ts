import type { Contracts } from "@jonloucks/contracts-ts";
import type { Open } from "@jonloucks/contracts-ts/api/Open";

/**
 * Interface representing the Installer, which is responsible for setting up the necessary components and dependencies for the badges-ts CLI to function properly. 
 */
export interface Config {
  contracts?: Contracts;
}

/**
 * The Installer interface defines the contract for an installer that can be opened to set up the necessary components and dependencies for the badges-ts CLI. 
 * It extends the AutoOpen interface, allowing it to be used in contexts where automatic opening and closing of resources is desired.
 * Implementations of this interface should provide the logic for initializing the required components and managing their lifecycle, ensuring that resources are properly released when no longer needed.
 */
export type { Open as Installer };

