import { ok } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

// ignore any IDE warnings about the following imports, they are resolved correctly in the test environment
import { VERSION, NAME } from "@jonloucks/badges-ts/version"; 

describe('Smoke tests', () => {

  beforeEach(() => {
    // Setup code before each test if needed
  });

  afterEach(() => {
    // Cleanup code after each test if needed
  });

  it('should have a VERSION export', () => {
    ok(typeof VERSION === 'string', 'VERSION should be a string');
  });

  it('should have a NAME export', () => {
    ok(typeof NAME === 'string', 'NAME should be a string');
  });

  it('VERSION should follow semantic versioning format', () => {
    const semverRegex: RegExp = /^\d+\.\d+\.\d+(-\S+)?$/;
    ok(semverRegex.test(VERSION), `VERSION should follow semantic versioning format, got: ${VERSION}`);
  });
});


