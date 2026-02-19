import { ok, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { Internal } from "./Internal.impl.js";
import { toContext } from "./Command.impl.js";
import { 
  KIT_0_PERCENT_COLOR, 
  KIT_100_PERCENT_COLOR, 
  KIT_ABOVE_60_PERCENT_COLOR, 
  KIT_ABOVE_70_PERCENT_COLOR,
  KIT_ABOVE_80_PERCENT_COLOR, 
  KIT_ABOVE_90_PERCENT_COLOR, 
  KIT_BELOW_60_PERCENT_COLOR 
} from "@jonloucks/badges-ts/api/Variances";

describe("Internal resolveContracts", () => {

  it("returns first config with contracts when multiple configs are provided", () => {
    const firstContracts = CONTRACTS;
    const secondContracts = CONTRACTS;
    const thirdContracts = CONTRACTS;

    const result = Internal.resolveContracts(
      { contracts: firstContracts },
      { contracts: secondContracts },
      { contracts: thirdContracts }
    );

    strictEqual(result, firstContracts, "Should return first config with contracts");
  });

  it("returns contracts when single config with contracts is provided", () => {
    const contracts = CONTRACTS;

    const result = Internal.resolveContracts(
      { contracts }
    );

    strictEqual(result, contracts, "Should return the contracts");
  });

  it("returns contracts from second config when first has no contracts", () => {
    const fallbackContracts = CONTRACTS;

    const result = Internal.resolveContracts(
      {},
      { contracts: fallbackContracts }
    );

    strictEqual(result, fallbackContracts, "Should return fallback contracts");
  });

  it("returns default CONTRACTS when no configs have contracts", () => {
    const result = Internal.resolveContracts(
      {},
      {}
    );

    strictEqual(result, CONTRACTS, "Should return default CONTRACTS");
  });

  it("skips configs with undefined contracts and uses the first defined one", () => {
    const definedContracts = CONTRACTS;

    const result = Internal.resolveContracts(
      { contracts: undefined },
      { contracts: definedContracts },
      { contracts: CONTRACTS }
    );

    strictEqual(result, definedContracts, "Should return the first defined contracts");
  });

  it("handles three or more configs", () => {
    const thirdContracts = CONTRACTS;

    const result = Internal.resolveContracts(
      {},
      {},
      { contracts: thirdContracts },
      { contracts: CONTRACTS }
    );

    strictEqual(result, thirdContracts, "Should return the third config's contracts");
  });

  it("returns default CONTRACTS when all configs have undefined contracts", () => {
    const result = Internal.resolveContracts(
      { contracts: undefined },
      { contracts: undefined },
      { contracts: undefined }
    );

    strictEqual(result, CONTRACTS, "Should return default CONTRACTS");
  });

  it("returns default CONTRACTS when no arguments are provided", () => {
    const result = Internal.resolveContracts();

    strictEqual(result, CONTRACTS, "Should return default CONTRACTS");
  });

  it("handles configs with extra properties", () => {
    const primaryContracts = CONTRACTS;

    const result = Internal.resolveContracts(
      { contracts: CONTRACTS, otherProp: "ignored" } as unknown as { contracts: typeof CONTRACTS },
      { contracts: primaryContracts, anotherProp: "also ignored" } as unknown as { contracts: typeof CONTRACTS }
    );

    strictEqual(result, CONTRACTS, "Should return first config's contracts ignoring extra properties");
  });

  it("returns same CONTRACTS instance each time when resolving to default", () => {
    const result1 = Internal.resolveContracts();
    const result2 = Internal.resolveContracts({}, {});
    const result3 = Internal.resolveContracts({ contracts: undefined });

    strictEqual(result1, result2, "Should return same CONTRACTS instance");
    strictEqual(result2, result3, "Should return same CONTRACTS instance");
    strictEqual(result1, CONTRACTS, "Should return the CONTRACTS constant");
  });

  it("isPercent should validate percent boundaries and invalid values", () => {
    strictEqual(Internal.isPercent(0), true, "0 should be a valid percent");
    strictEqual(Internal.isPercent(100), true, "100 should be a valid percent");
    strictEqual(Internal.isPercent(42.5), true, "Decimals in range should be valid");
    strictEqual(Internal.isPercent(100.01), true, "Values greater than 100 should be valid");
    strictEqual(Internal.isPercent(150.0), true, "Values greater than 150 should be valid");

    strictEqual(Internal.isPercent(-0.01), false, "Negative values should be invalid");
    strictEqual(Internal.isPercent(Number.NaN), false, "NaN should be invalid");
    strictEqual(Internal.isPercent(Number.POSITIVE_INFINITY), false, "Infinity should be invalid");
    strictEqual(Internal.isPercent(Number.NEGATIVE_INFINITY), false, "-Infinity should be invalid");
  });

  it("formatPercent should format valid percentages and reject invalid values", () => {
    strictEqual(Internal.formatPercent(100), '100%', "100 should be formatted without decimal place");
    strictEqual(Internal.formatPercent(0), '0%', "0 should be formatted as 0%");
    strictEqual(Internal.formatPercent(0.0), '0%', "0.0 should be formatted as 0%");
    strictEqual(Internal.formatPercent(0.04), '0%', "Values below the rounding threshold should be rounded down to 0%");
    strictEqual(Internal.formatPercent(0.05), '0.1%', "Values at or above the rounding threshold should keep one decimal place");
    strictEqual(Internal.formatPercent(42.54), '42.5%', "Valid values should be formatted to one decimal place");
    strictEqual(Internal.formatPercent(101), '100%', "Values above 100 should format as 100%");

    strictEqual(Internal.formatPercent(-1), 'N/A', "Negative values should format as N/A");
    strictEqual(Internal.formatPercent(Number.NaN), 'N/A', "NaN should format as N/A");
    strictEqual(Internal.formatPercent(Number.POSITIVE_INFINITY), 'N/A', "Infinity should format as N/A");
  });

  it("normalizePercent should pass through valid values and clamp invalid ranges", () => {
    strictEqual(Internal.normalizePercent(0), 0, "0 should remain 0");
    strictEqual(Internal.normalizePercent(42.5), 42.5, "In-range values should be unchanged");
    strictEqual(Internal.normalizePercent(100), 100, "100 should remain 100");
    strictEqual(Internal.normalizePercent(100.01), 100, "Values above 100 should clamp to 100");
    strictEqual(Internal.normalizePercent(150), 100, "Values far above 100 should clamp to 100");

    strictEqual(Internal.normalizePercent(-1), 0, "Negative values should normalize to 0");
    strictEqual(Internal.normalizePercent(Number.NaN), 0, "NaN should normalize to 0");
    strictEqual(Internal.normalizePercent(Number.POSITIVE_INFINITY), 0, "Infinity should normalize to 0");
    strictEqual(Internal.normalizePercent(Number.NEGATIVE_INFINITY), 0, "-Infinity should normalize to 0");
  });

  it("colorFromPercentComplete should return correct colors based on percent", () => {
    const context: Context = toContext([]);
    ok(Internal.colorFromPercentComplete(context, 100), "Should return success color for 100%");
  });

  it("getColorVariant should return correct color variants based on percent", () => {
    strictEqual(Internal.getColorVariant(100), KIT_100_PERCENT_COLOR, "Should return 100% color variant for 100%");
    strictEqual(Internal.getColorVariant(95), KIT_ABOVE_90_PERCENT_COLOR, "Should return above 90% color variant for 95%");
    strictEqual(Internal.getColorVariant(85), KIT_ABOVE_80_PERCENT_COLOR, "Should return above 80% color variant for 85%");
    strictEqual(Internal.getColorVariant(75), KIT_ABOVE_70_PERCENT_COLOR, "Should return above 70% color variant for 75%");
    strictEqual(Internal.getColorVariant(65), KIT_ABOVE_60_PERCENT_COLOR, "Should return above 60% color variant for 65%");
    strictEqual(Internal.getColorVariant(50), KIT_BELOW_60_PERCENT_COLOR, "Should return below 60% color variant for 50%");
    strictEqual(Internal.getColorVariant(0), KIT_0_PERCENT_COLOR, "Should return 0% color variant for 0%"); 
  });
});