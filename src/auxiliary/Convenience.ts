import { RequiredType, OptionalType } from "@jonloucks/badges-ts/api/Types";
import { Badges } from "@jonloucks/badges-ts/api/Badges";

export { Badges, RequiredType, OptionalType };

/**
 * @module Convenience
 * @description
 * 
 * This module provides convenience functions for creating auxiliary types
 * using the shared global BADGES instance. For performance-sensitive
 * applications, consider using factory instances directly to avoid the
 * overhead of enforcing the factory contract on each creation. 
 * 
 * Internal Note: To avoid circular dependencies, other modules should not
 * import from this module. Instead, they should import directly from the
 * source modules of the auxiliary types. 
 */

