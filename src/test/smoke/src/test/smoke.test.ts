import { ok } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";


// ignore any IDE warnings about the following imports, they are resolved correctly in the test environment
import { VERSION } from "@jonloucks/badges-ts/version"; 

describe('Smoke tests', () => {

  beforeEach(() => {
    // Setup code before each test if needed
  });

  afterEach(() => {
    // Cleanup code after each test if needed
  });

  it('should run a simple test to verify the testing framework is working', () => {
    ok(VERSION, 'VERSION should be defined');
  });
});


