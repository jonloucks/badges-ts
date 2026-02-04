import { ok, strictEqual } from "node:assert";

import { presentCheck, used } from "@jonloucks/badges-ts/auxiliary/Checks";

import {
  Duration,
  guardFunctions,
  isNotPresent,
  isNumber,
  isPresent,
  isString,
  isThrowable,
  MAX_TIMEOUT,
  MIN_TIMEOUT,
  OptionalType,
  RequiredType,
  Throwable
} from "@jonloucks/badges-ts/api/Types";

describe("Types", () => {
  describe("isThrowable", () => {
    it("should return true for all values", () => {
      expect(isThrowable(null)).toBe(true);
      expect(isThrowable(undefined)).toBe(true);
      expect(isThrowable(new Error("error"))).toBe(true);
      expect(isThrowable("string")).toBe(true);
      expect(isThrowable(42)).toBe(true);
      expect(isThrowable({})).toBe(true);
      expect(isThrowable([])).toBe(true);
    });
  });
});

describe('Duration Type Tests', () => {
  it('Duration type should create correct durations', () => {
    const duration1: Duration = { milliSeconds: 5000 };
    const duration2: Duration = { milliSeconds: 0 };
    const duration3: Duration = { milliSeconds: 123456789 };
    strictEqual(duration1.milliSeconds, 5000, 'duration1 should be 5000 milliseconds');
    strictEqual(duration2.milliSeconds, 0, 'duration2 should be 0 milliseconds');
    strictEqual(duration3.milliSeconds, 123456789, 'duration3 should be 123456789 milliseconds');
  });
});

describe('badges-ts/auxiliary/Checks Index exports', () => {
  it('should export all expected members', () => {
    strictEqual(presentCheck("green", "not easy being green"), "green");
    assertNothing(null as OptionalType<Throwable<number>>);
    assertNothing("abc" as RequiredType<string>);
    ok(isString, 'isString should be accessible');
    ok(isNumber, 'isNumber should be accessible');
    ok(isPresent, 'isPresent should be accessible');
    ok(isNotPresent, 'isNotPresent should be accessible');
  });
});

describe('Constants', () => {
  it('should have a positive min timeout', () => {
    strictEqual(MIN_TIMEOUT.milliSeconds >= 0, true, 'MIN_TIMEOUT should be positive');
  });

  it('should have a max timeout greater than min timeout', () => {
    strictEqual(MAX_TIMEOUT.milliSeconds > MIN_TIMEOUT.milliSeconds, true, 'MAX_TIMEOUT should be greater than MIN_TIMEOUT');
  });

  it('should have max timeout less than or equal to Number.MAX_SAFE_INTEGER', () => {
    strictEqual(MAX_TIMEOUT.milliSeconds <= Number.MAX_SAFE_INTEGER, true, 'MAX_TIMEOUT should be less than or equal to Number.MAX_SAFE_INTEGER');
  });

  it('should have MIN_TIMEOUT equal to 0', () => {
    strictEqual(MIN_TIMEOUT.milliSeconds, 0, 'MIN_TIMEOUT should be 0 milliseconds');
  });

  it('should have MAX_TIMEOUT equal to Number.MAX_SAFE_INTEGER', () => {
    strictEqual(MAX_TIMEOUT.milliSeconds, Number.MAX_SAFE_INTEGER, 'MAX_TIMEOUT should be Number.MAX_SAFE_INTEGER');
  });
});

describe('Throwable Type', () => {
  it('should allow null values', () => {
    const throwable: Throwable<string> = null;
    strictEqual(throwable, null);
  });

  it('should allow undefined values', () => {
    const throwable: Throwable<number> = undefined;
    strictEqual(throwable, undefined);
  });

  it('should allow actual values', () => {
    const throwable: Throwable<string> = "value";
    strictEqual(throwable, "value");
  });
});

describe('Type Guards from contracts-ts', () => {
  it('isString should correctly identify strings', () => {
    strictEqual(isString("test"), true, 'Should identify string');
    strictEqual(isString(123), false, 'Should not identify number as string');
    strictEqual(isString(null), false, 'Should not identify null as string');
  });

  it('isNumber should correctly identify numbers', () => {
    strictEqual(isNumber(123), true, 'Should identify number');
    strictEqual(isNumber("test"), false, 'Should not identify string as number');
    strictEqual(isNumber(null), false, 'Should not identify null as number');
  });

  it('isPresent should correctly identify present values', () => {
    strictEqual(isPresent("test"), true, 'Should identify string as present');
    strictEqual(isPresent(0), true, 'Should identify 0 as present');
    strictEqual(isPresent(false), true, 'Should identify false as present');
    strictEqual(isPresent(null), false, 'Should identify null as not present');
    strictEqual(isPresent(undefined), false, 'Should identify undefined as not present');
  });

  it('isNotPresent should correctly identify absent values', () => {
    strictEqual(isNotPresent(null), true, 'Should identify null as not present');
    strictEqual(isNotPresent(undefined), true, 'Should identify undefined as not present');
    strictEqual(isNotPresent("test"), false, 'Should identify string as present');
    strictEqual(isNotPresent(0), false, 'Should identify 0 as present');
  });
});

describe('Duration with different millisecond values', () => {
  it('should handle negative milliseconds', () => {
    const duration: Duration = { milliSeconds: -100 };
    strictEqual(duration.milliSeconds, -100);
  });

  it('should handle very large milliseconds', () => {
    const duration: Duration = { milliSeconds: Number.MAX_SAFE_INTEGER };
    strictEqual(duration.milliSeconds, Number.MAX_SAFE_INTEGER);
  });

  it('should handle fractional milliseconds', () => {
    const duration: Duration = { milliSeconds: 123.456 };
    strictEqual(duration.milliSeconds, 123.456);
  });
});

describe('guardFunctions utility', () => {
  it('is exported', () => {
    ok(guardFunctions, 'guardFunctions should be exported');
  });
});

function assertNothing(value: OptionalType<unknown>): void {
  used(value);
  ok(true, 'This function is only for compile-time type checking and should never be called at runtime');
}