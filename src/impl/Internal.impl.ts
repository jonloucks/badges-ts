
import { CONTRACTS, type Contracts } from "@jonloucks/contracts-ts";
import { isNotPresent, isPresent, type RequiredType } from "@jonloucks/contracts-ts/api/Types";
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const OVERRIDE_RUNNING: Map<string, boolean> = new Map<string, boolean>();

export const SUCCESS_COLOR: string = '#4bc124';


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
  resolveContracts(...configs: Array<{ contracts?: Contracts } | undefined>): RequiredType<Contracts> {
    for (const config of configs) {
      if (isPresent(config) && isPresent(config?.contracts)) {
        return config.contracts;
      }
    }
    return CONTRACTS;
  },

  colorFromPercentComplete(percent: number): string {
    if (percent >= 95) {
      return SUCCESS_COLOR;
    } else if (percent >= 75) {
      return 'yellowgreen';
    } else if (percent >= 60) {
      return 'yellow';
    } else if (percent >= 40) {
      return 'orange';
    } else {
      return 'red';
    }
  },

  isRunning(metaUrl: string): boolean {
    if (isNotPresent(metaUrl) || metaUrl.length === 0) {
      return false;
    }
    if (OVERRIDE_RUNNING.has(metaUrl)) {
      return OVERRIDE_RUNNING.get(metaUrl) as boolean;
    } 
    return isPresent(process.argv[1]) && resolve(process.argv[1]) === resolve(fileURLToPath(metaUrl));
  }
}