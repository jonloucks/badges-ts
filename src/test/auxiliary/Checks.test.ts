import { ok, throws } from "node:assert";

import {
  illegalCheck,
  presentCheck,
  timeoutCheck,
  configCheck,
  used,
  Duration
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
