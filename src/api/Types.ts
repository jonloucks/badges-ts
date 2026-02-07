export { guardFunctions, isNotPresent, isNumber, isPresent, isString, OptionalType, RequiredType } from "@jonloucks/contracts-ts/api/Types";

// candidate for inclusion in api-ts
/**
 * A type that can be a value of type T, null, or undefined
 */
export type Throwable<T> = T | null | undefined;

/**
 * Type guard to determine if a value is Throwable
 *
 * @param value the value to check
 * @return true if the value is Throwable
 */
export function isThrowable<T>(value: unknown): value is Throwable<T> { return true; }

// review if there is a something better to use here, like Java's Duration
// candidate for inclusion in api-ts
export interface Duration {
  get milliSeconds(): number;
}

/**
 * The minimum timeout duration
 */
export const MIN_TIMEOUT: Duration = {
  get milliSeconds() : number {
    return 0;
  }
};

/**
 * The maximum timeout duration
 */
export const MAX_TIMEOUT: Duration = {
  get milliSeconds() : number {
    return Number.MAX_SAFE_INTEGER;
  }
};

export interface Display {

  error(message: string): void;

  info(message: string): void;

  warn(message: string): void;

  trace(message: string): void;

  dry(message: string): void;
}

export interface Flags {

  dryRun: boolean;

  quiet: boolean;

  trace: boolean;

  warn: boolean;

  verbose: boolean;
}