import { ok } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

import { OVERRIDE_RUNNING } from "../impl/Internal.impl.js";

describe('Main module', () => {

  beforeEach(() => {
    OVERRIDE_RUNNING.clear();
    const metaUrl: string = import.meta.url.replace("/test/cli.run.test.ts", "/cli.ts");
    OVERRIDE_RUNNING.set(metaUrl, true);
  });

  afterEach(() => {
    OVERRIDE_RUNNING.clear();
  });

  describe('run main function', () => {
    it('run command line', async () => {
      const module = await import("@jonloucks/badges-ts/cli");
      ok(module, 'runMain should be exported from cli.js');
    });
  });
});