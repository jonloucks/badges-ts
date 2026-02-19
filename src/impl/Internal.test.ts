import { ok, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Internal, SUCCESS_COLOR } from "./Internal.impl.js";

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

  it ("colorFromPercentComplete should return correct colors based on percent", () => { 
    strictEqual(Internal.colorFromPercentComplete(100), SUCCESS_COLOR, "Should return success color for 100%");
    strictEqual(Internal.colorFromPercentComplete(95), SUCCESS_COLOR, "Should return success color for 95%");
    strictEqual(Internal.colorFromPercentComplete(94.99), 'yellowgreen', "Should return yellowgreen for just under 95%");
    strictEqual(Internal.colorFromPercentComplete(80), 'yellowgreen', "Should return yellowgreen for 80%");
    strictEqual(Internal.colorFromPercentComplete(75), 'yellowgreen', "Should return yellowgreen for 75%");
    strictEqual(Internal.colorFromPercentComplete(74.99), 'yellow', "Should return yellow for just under 75%");
    strictEqual(Internal.colorFromPercentComplete(65), 'yellow', "Should return yellow for 65%");
    strictEqual(Internal.colorFromPercentComplete(60), 'yellow', "Should return yellow for 60%");
    strictEqual(Internal.colorFromPercentComplete(59.99), 'orange', "Should return orange for just under 60%");
    strictEqual(Internal.colorFromPercentComplete(50), 'orange', "Should return orange for 50%");
    strictEqual(Internal.colorFromPercentComplete(40), 'orange', "Should return orange for 40%");
    strictEqual(Internal.colorFromPercentComplete(39.99), 'red', "Should return red for just under 40%");
    strictEqual(Internal.colorFromPercentComplete(20), 'red', "Should return red for 20%");
    strictEqual(Internal.colorFromPercentComplete(0), 'red', "Should return red for 0%"); 
    ok(Internal.colorFromPercentComplete(-1), "Negative percent should return a color");
    strictEqual(Internal.colorFromPercentComplete(150), SUCCESS_COLOR, "Percent over 100 should return a color"); 
  });
});