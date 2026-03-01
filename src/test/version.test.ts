import { VERSION as TS_VERSION } from "@jonloucks/badges-ts";
import { VERSION, NAME } from "@jonloucks/badges-ts/version";
import { ok } from "node:assert";
import { describe, it } from "node:test";

describe('Version module', () => {
  it('should have a VERSION export', () => {
    ok(typeof VERSION === 'string', 'VERSION should be a string');
  });

  it('VERSION should follow semantic versioning format', () => {
    const semverRegex: RegExp = /^\d+\.\d+\.\d+(-\S+)?$/;
    ok(semverRegex.test(VERSION), `VERSION should follow semantic versioning format, got: ${VERSION}`);
  });

  it ('VERSION should be the same for badges-ts and the main version export', () => {
    ok(VERSION === TS_VERSION, `VERSION from version module should match main VERSION export, got: ${VERSION} and ${TS_VERSION}`);
  });

  it('should have a NAME export', () => {
    ok(typeof NAME === 'string', 'NAME should be a string');
  });
});