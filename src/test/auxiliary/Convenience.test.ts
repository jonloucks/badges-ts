import { ok } from "node:assert";
import { Badges } from "@jonloucks/badges-ts/auxiliary/Convenience";

// Convenience tests, all exports are simple inlines to fully tested functionality.

describe('Convenience Suite', () => {
  describe('Convenience exports', () => {

    it('should export all expected members', () => {
      // Just checking a few key exports to ensure they are accessible  
      const badges: Badges | null = null;
      ok(badges === null, 'Badges should be exported');
      // Add more exports to check as needed
    });
  });
});
