import { ok, strictEqual } from "node:assert";

import { OptionalType } from "@jonloucks/badges-ts/api/Types";
import { presentCheck, used } from "@jonloucks/badges-ts/auxiliary/Checks";

/** 
 * Tests for @jonloucks/badges-ts/auxiliary exports
 * All exported functions and constants must already have been tested in their respective test files
 * These tests ensure that the index exports are correctly set up and accessible
 * If this file fails to compile, it indicates a possible breaking for deployment consumers
 */

describe('auxiliary exports', () => {
  it('should export all expected members', () => {
    strictEqual(presentCheck("green", "not easy being green"), "green");
    assertNothing(null as OptionalType<unknown>);
  });
});

function assertNothing(value: OptionalType<unknown>): void {
  used(value);
  ok(true, 'This function is only for compile-time type checking and should never be called at runtime');
}
