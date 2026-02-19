
import { CONTRACTS, type Contracts } from "@jonloucks/contracts-ts";
import { isPresent, type RequiredType } from "@jonloucks/contracts-ts/api/Types";
import { Context } from "../auxiliary/Command.js";
import { Variant } from "@jonloucks/variants-ts/api/Variant";
import { 
  KIT_0_PERCENT_COLOR, 
  KIT_100_PERCENT_COLOR, 
  KIT_ABOVE_80_PERCENT_COLOR, 
  KIT_BELOW_60_PERCENT_COLOR, 
  KIT_ABOVE_60_PERCENT_COLOR, 
  KIT_ABOVE_70_PERCENT_COLOR,  
  KIT_ABOVE_90_PERCENT_COLOR } from "../api/Variances.js";

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

  getColorVariant(percent: number): Variant<string> {
    const normalizedPercent = Internal.normalizePercent(percent);
    if (normalizedPercent === 100) {
      return KIT_100_PERCENT_COLOR;
    } else if (normalizedPercent>= 90) {
      return KIT_ABOVE_90_PERCENT_COLOR;
    } else if (normalizedPercent >= 80) {
      return KIT_ABOVE_80_PERCENT_COLOR;
    } else if (normalizedPercent >= 70) {
      return KIT_ABOVE_70_PERCENT_COLOR;
    } else if (normalizedPercent >= 60) {
      return KIT_ABOVE_60_PERCENT_COLOR;
    } else if (normalizedPercent > 0) {
      return KIT_BELOW_60_PERCENT_COLOR;
    } else {
      return KIT_0_PERCENT_COLOR;
    }
  },

  colorFromPercentComplete(context: Context, percent: number): string {
    return context.environment.getVariance(Internal.getColorVariant(percent));
  },

  formatPercent(percent: number): string {
    if (Internal.isPercent(percent)) {
      if (percent >= 100) {
        return '100%';
      } else if (percent < 0.05) {
        return '0%';
      } else {
        return `${percent.toFixed(1)}%`
      }
    } else {
      return 'N/A';
    }
  },

  isPercent(percent: number): boolean {
    return isPresent(percent) && !isNaN(percent) && isFinite(percent) && percent >= 0;
  },

  normalizePercent(percent: number): number {
    if (Internal.isPercent(percent)) {
      if (percent > 100) {
        return 100;
      } else {
        return percent;
      }
    } else {
      return 0;
    }
  }
}