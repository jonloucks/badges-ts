import { mkdtempSync, rmSync } from "fs";
import { ok, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import { tmpdir } from "os";
import { join } from "path";

import {
  configCheck,
  Duration,
  fileDoesNotExist,
  illegalCheck,
  isNonEmptyString,
  presentCheck,
  timeoutCheck,
  used
} from "@jonloucks/badges-ts/auxiliary/Checks";

describe('Index exports', () => {
  it('should export all check functions', () => {
    ok(presentCheck, 'presentCheck should be exported');
    ok(illegalCheck, 'illegalCheck should be exported');
    ok(timeoutCheck, 'timeoutCheck should be exported');
    ok(configCheck, 'configCheck should be exported');
    ok(used, 'used should be exported');
  });
});

describe('timeoutCheck function', () => {
  it('should return the provided timeout when it is valid', () => {
    const timeout: Duration = { milliSeconds: 5000 };
    const result = timeoutCheck(timeout);
    ok(result === timeout, 'timeoutCheck should return the original timeout when valid');
  });

  it('should accept zero timeout', () => {
    const timeout: Duration = { milliSeconds: 0 };
    const result = timeoutCheck(timeout);
    ok(result === timeout, 'timeoutCheck should accept zero timeout');
  });

  it('should throw IllegalArgumentException when timeout is null', () => {
    throws(() => {
      timeoutCheck(null as unknown as Duration);
    }, {
      name: 'IllegalArgumentException',
      message: 'Timeout must be present.'
    });
  });

  it('should throw IllegalArgumentException when timeout is undefined', () => {
    throws(() => {
      timeoutCheck(undefined as unknown as Duration);
    }, {
      name: 'IllegalArgumentException',
      message: 'Timeout must be present.'
    });
  });

  it('should throw IllegalArgumentException when timeout is negative', () => {
    throws(() => {
      timeoutCheck({ milliSeconds: -100 });
    }, {
      name: 'IllegalArgumentException',
      message: 'Timeout must not be negative.'
    });
  });

  it('should throw IllegalArgumentException when timeout exceeds MAX_TIMEOUT', () => {
    throws(() => {
      timeoutCheck({ milliSeconds: Number.MAX_SAFE_INTEGER + 1 });
    }, {
      name: 'IllegalArgumentException',
      message: 'Timeout must be less than or equal to maximum time.'
    });
  });

  it('should accept MAX_TIMEOUT', () => {
    const timeout: Duration = { milliSeconds: Number.MAX_SAFE_INTEGER };
    const result = timeoutCheck(timeout);
    ok(result === timeout, 'timeoutCheck should accept MAX_TIMEOUT');
  });
});

describe('isNonEmptyString function', () => {
  it('should return true for a non-empty string', () => {
    strictEqual(isNonEmptyString('hello'), true, 'isNonEmptyString should return true for non-empty string');
  });

  it('should return true for a string with spaces', () => {
    strictEqual(isNonEmptyString('  hello  '), true, 'isNonEmptyString should return true for string with spaces');
  });

  it('should return true for a single character string', () => {
    strictEqual(isNonEmptyString('a'), true, 'isNonEmptyString should return true for single character');
  });

  it('should return false for an empty string', () => {
    strictEqual(isNonEmptyString(''), false, 'isNonEmptyString should return false for empty string');
  });

  it('should return false for a string with only whitespace', () => {
    strictEqual(isNonEmptyString('   '), false, 'isNonEmptyString should return false for whitespace-only string');
  });

  it('should return false for null', () => {
    strictEqual(isNonEmptyString(null), false, 'isNonEmptyString should return false for null');
  });

  it('should return false for undefined', () => {
    strictEqual(isNonEmptyString(undefined), false, 'isNonEmptyString should return false for undefined');
  });

  it('should return false for a number', () => {
    strictEqual(isNonEmptyString(123), false, 'isNonEmptyString should return false for number');
  });

  it('should return false for a boolean', () => {
    strictEqual(isNonEmptyString(true), false, 'isNonEmptyString should return false for boolean');
  });

  it('should return false for an object', () => {
    strictEqual(isNonEmptyString({}), false, 'isNonEmptyString should return false for object');
  });

  it('should return false for an array', () => {
    strictEqual(isNonEmptyString([]), false, 'isNonEmptyString should return false for array');
  });
});

describe('fileDoesNotExist function', () => {
  it('should return true when file does not exist', () => {
    const nonExistentPath = join(tmpdir(), 'non-existent-file-' + Date.now() + '.txt');
    strictEqual(fileDoesNotExist(nonExistentPath), true, 'fileDoesNotExist should return true for non-existent file');
  });

  it('should return false when file exists', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'test-'));
    try {
      strictEqual(fileDoesNotExist(tempDir), false, 'fileDoesNotExist should return false for existing directory');
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });

  it('should throw IllegalArgumentException when path is null', () => {
    throws(() => {
      fileDoesNotExist(null as unknown as string);
    }, {
      name: 'IllegalArgumentException',
      message: 'Path must be present.'
    });
  });

  it('should throw IllegalArgumentException when path is undefined', () => {
    throws(() => {
      fileDoesNotExist(undefined as unknown as string);
    }, {
      name: 'IllegalArgumentException',
      message: 'Path must be present.'
    });
  });

  it('should handle empty string path', () => {
    // Empty string doesn't throw presentCheck, but existsSync returns false for it
    const result = fileDoesNotExist('');
    strictEqual(result, true, 'fileDoesNotExist should return true for empty string path');
  });
});
