import assert, { ok } from "node:assert";

import { MockProxy } from "jest-mock-extended/lib/Mock";
import { mock } from "jest-mock-extended";

describe('Helper Tests', () => {
  it('should run a place holder test', () => {
    ok(true, 'Place holder test should pass');
  });
});


/**
 * It breaks duck typing in jest-mock-extended mocks unless we access the properties.
 * Production code now avoids calls that would trigger mock to create any method or property.
 * This behavior would cause ALL guard checks to pass incorrectly.
 * 
 * @param propertyNames the names of methods to be auto created
 */
export function mockDuck<T>(...propertyNames: (string | symbol)[]): MockProxy<T> {
  const mocked: MockProxy<T> = mock<T>();
  const lookup = mocked as Record<string | symbol, unknown>;
  for (const propertyName of propertyNames) {
    // Access the property to force jest-mock-extended to create the method
    assert(lookup[propertyName]);
  }
  return mocked;
}

type Guard<T> = (o: unknown) => o is T;

export function assertGuard<T>(guard: Guard<T>, ...propertyNames: (string | symbol)[]): void {
  if (propertyNames.length === 0) {
    return;
  }

  const combinations: (string | symbol)[][] = generateCombinations(propertyNames);
  combinations.forEach((combination) => {
    const joinedMixed: string = combination
      .map(item => typeof item === 'symbol' ? String(item) : item)
      .join(', ');

    it(`Guard should return true for object with properties: ${joinedMixed}`, () => {
      const obj: Record<string | symbol, unknown> = {};
      combination.forEach((prop) => {
        obj[prop] = (): void => { }; // currently assuming a function
      });
      if (combination.length === propertyNames.length) {
        // Full set of properties
        ok(guard(obj), `Object with all properties ${joinedMixed} should be recognized as duck type`);
      } else {
        // Partial set of properties
        ok(!guard(obj), `Object with partial properties ${joinedMixed} should NOT be recognized as duck type`);
      }
    });
  });
  it(`Guard should return false for object with no properties`, () => {
    const emptyObj: Record<string | symbol, unknown> = {};
    ok(!guard(emptyObj), `Empty object should not be recognized as duck type`);
  });
  it(`Guard should return false for null and undefined`, () => {
    ok(!guard(null), 'guard should never return null');
    ok(!guard(undefined), 'guard should never return undefined');
  });
};

function generateCombinations<T>(items: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(index: number, currentCombination: T[]): void {
    // Add the current combination to the results list
    result.push([...currentCombination]);

    // Iterate through the remaining elements
    for (let i = index; i < items.length; i++) {
      // Include the current element in the combination
      currentCombination.push(items[i]);
      // Recurse to find combinations with the current element included
      backtrack(i + 1, currentCombination);
      // Backtrack: remove the current element to explore other possibilities
      currentCombination.pop();
    }
  }

  backtrack(0, []);
  return result;
}