import { messageCheck } from "@jonloucks/contracts-ts/auxiliary/Checks"
import { isNotPresent } from "@jonloucks/contracts-ts/api/Types";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";

/**
 * Runtime exception thrown for Badge related problems.
 */
export class BadgeException extends Error {

  /**
   * Passthrough for {@link Error(String, Throwable)}
   *
   * @param message the message for this exception
   * @param thrown  the cause of this exception, null is allowed
   */
  public constructor(message: string, thrown: Error | null = null) {
    // super(messageCheck(message), thrown || undefined);
    super(messageCheck(message));
    used(thrown);
    this.name = "BadgeException";
    Object.setPrototypeOf(this, BadgeException.prototype)
  }

  /**
   * Ensure something that was caught is rethrown as a BadgeException
   * @param caught the caught value
   * @param message the optional message to use if caught is not an BadgeException
   */
  static rethrow(caught: unknown, message?: string): never {
    if (isNotPresent(caught)) {
       this.throwUnknown(message);
    } else if (guard(caught)) {
      throw caught;
    } else if (caught instanceof Error) {
      throw new BadgeException(message ?? caught.message, caught);
    } else {
       this.throwUnknown(message);
    }
  }

  private static throwUnknown( message?: string): never {
    throw new BadgeException(message ?? "Unknown type of caught value.");
  }
}

/**
 * Determine if an instance is a BadgeException
 *
 * @param instance the instance to check
 * @returns true if the instance is a BadgeException
 */
export function guard(instance: unknown): instance is BadgeException {
  return instance instanceof BadgeException;
}

