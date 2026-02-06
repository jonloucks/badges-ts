import { strictEqual } from "node:assert";

import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Internal } from "./Internal.impl";

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
      { },
      { contracts: fallbackContracts }
    );

    strictEqual(result, fallbackContracts, "Should return fallback contracts");
  });

  it("returns default CONTRACTS when no configs have contracts", () => {
    const result = Internal.resolveContracts(
      { },
      { }
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
      { },
      { },
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
  });});
