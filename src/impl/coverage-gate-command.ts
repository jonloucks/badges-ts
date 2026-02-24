import { Coverage } from "@jonloucks/badges-ts/api/Coverage";
import { isPresent } from "@jonloucks/badges-ts/api/Types";
import { KIT_REQUIRED_CODE_COVERAGE } from "@jonloucks/badges-ts/api/Variances";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { CONTRACT as DISCOVER_COVERAGE } from "@jonloucks/badges-ts/auxiliary/DiscoverCoverage";
import { CONTRACTS } from "@jonloucks/contracts-ts";

import { Internal } from "./Internal.impl.js";

/**
 * Implements the coverage gate command, which checks if the code coverage meets a specified threshold.
 * The threshold can be provided via a command line argument or through environment variances.
 * If the coverage is below the gate, an error is thrown to indicate the failure.
 */
export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running coverage-gate with: ${context.arguments.join(' ')}`);
    const gate: number = getCoverageGate(context);
    if (gate <= 0) {
      context.display.info(`No coverage gate configured (gate value: ${gate}). Skipping coverage gate check.`);
      return;
    }
    const coverage = await discoverCoverage(context);
    if (coverage.percentage < gate) {
      const message = `Code coverage gate failed: ${Internal.formatPercent(coverage.percentage)}% < ${Internal.formatPercent(gate)}%`;
      context.display.error(message);
      throw new Error(message);
    } else {
      context.display.info(`Code coverage gate passed: ${Internal.formatPercent(coverage.percentage)}% >= ${Internal.formatPercent(gate)}%`);
    }
  }
};

function getCoverageGate(context: Context): number {
  const gate: number | undefined = parseCommandLineForGate(context);
  // command line takes precedence over environment variance
  if (isPresent(gate)) {
    return gate;
  }
  return Internal.normalizePercent(context.environment.getVariance(KIT_REQUIRED_CODE_COVERAGE));
}

function parseCommandLineForGate(context: Context): number | undefined {
  const gateArgPrefix: string = '--required-coverage=';
  for (const arg of context.arguments) {
    if (arg.startsWith(gateArgPrefix)) {
      const value: string = arg.substring(gateArgPrefix.length);
      const parsed: number = parseFloat(value);
      if (Internal.isPercent(parsed)) {
        return Internal.normalizePercent(parsed);
      } else {
        const message: string = `Invalid coverage gate value provided via command line: ${value}. It should be a number between 0 and 100.`;
        context.display.error(message);
        throw new Error(message);
      }
    }
  }
  return undefined;
}

async function discoverCoverage(context: Context): Promise<Coverage> {
  return CONTRACTS.enforce(DISCOVER_COVERAGE).discoverCoverage(context);
}