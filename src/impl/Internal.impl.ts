
import { isPresent, RequiredType } from "@jonloucks/contracts-ts/api/Types";
import { CONTRACTS, Contracts } from "@jonloucks/contracts-ts";

/**
 * Helper functions for internal implementations.
 */
export const Internal = {

  /**
   * Resolves the contracts to use from the provided configurations.
   * Returns the first config with present contracts, or CONTRACTS as default.
   * @param configs the configurations to resolve from (in priority order)
   * @return the resolved contracts
   */
  resolveContracts(...configs: Array<{ contracts?: Contracts }| undefined>): RequiredType<Contracts> {
    for (const config of configs) {
      if (isPresent(config) && isPresent(config?.contracts)) {
        return config.contracts;
      }
    }
    return CONTRACTS;
  },

  getEnvPathOrDefault(envVarName: string, defaultPath: string): string {
    const myVarValue: string | undefined = process.env[envVarName];
    if (isPresent(myVarValue) && myVarValue.trim() !== '') {
      return myVarValue.trim();
    }
    return defaultPath;
  }
}