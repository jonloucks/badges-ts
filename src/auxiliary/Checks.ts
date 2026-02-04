import { OptionalType, RequiredType } from "@jonloucks/contracts-ts/api/Types";
import { illegalCheck, presentCheck, configCheck, used } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { Duration, MAX_TIMEOUT } from "@jonloucks/badges-ts/api/Types";

export { presentCheck, illegalCheck, configCheck, used, Duration, RequiredType, OptionalType };

/**
 * Check that a timeout is valid
 *
 * @param timeout the timeout to check
 * @return the timeout if valid
 * @throws IllegalArgumentException if the timeout is not valid
 */
export function timeoutCheck(timeout: OptionalType<Duration>): RequiredType<Duration> {
  const presentTimeout : RequiredType<Duration> = presentCheck(timeout, "Timeout must be present.");
  illegalCheck(timeout, presentTimeout.milliSeconds < 0, "Timeout must not be negative.");
  illegalCheck(timeout, presentTimeout.milliSeconds > MAX_TIMEOUT.milliSeconds, "Timeout must be less than or equal to maximum time.");
  return presentTimeout;
}