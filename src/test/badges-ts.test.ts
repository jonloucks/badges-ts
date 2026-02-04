import { ok } from "node:assert";

import { 
  VERSION, 
  Badge,
  BadgeConfig,
  Badges,
  BadgesConfig,
  RequiredType,
  OptionalType,
  BadgeException
} from "@jonloucks/badges-ts";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";

/** 
 * Tests for @jonloucks/badges-ts/api index 
 * All exported functions and constants must already have been tested in their respective test files
 * These tests ensure that the index exports are correctly set up and accessible
 * If this file fails to compile, it indicates a possible breaking for deployment consumers
 * @module @jonloucks/badges-ts/tests/badges-ts-api.test.ts
 */

describe('badges-ts/api Index exports', () => {
  it('should export all expected members', () => {
    ok(VERSION.length > 0, 'VERSION should be exported and non-empty');
    assertNothing(null as OptionalType<BadgeException>);
    ok(new BadgeException('Test').message === 'Test', 'BadgeException should be exported and constructible');
    assertNothing(null as OptionalType<RequiredType<unknown>>);
    assertNothing(null as OptionalType<OptionalType<unknown>>);
    assertNothing(null as OptionalType<Badges>);
    assertNothing(null as OptionalType<BadgesConfig>);
    assertNothing(null as OptionalType<Badge>);
    assertNothing(null as OptionalType<BadgeConfig>);
    ok(true, 'All exports are accessible'); // If we reach here, exports are accessible
  });
});

function assertNothing(value: OptionalType<unknown>): void {
  used(value);
  ok(true, 'This function is only for compile-time type checking and should never be called at runtime');
}
