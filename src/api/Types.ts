export type { OptionalType, RequiredType } from "@jonloucks/contracts-ts/api/Types";

export { guardFunctions, isNotPresent, isNumber, isPresent, isString } from "@jonloucks/contracts-ts/api/Types";

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

/**
 * Display interface representing the various logging levels and output methods available for use within the badges-ts CLI. 
 * This interface defines methods for logging messages at different levels (error, info, warn, trace, dry) to provide feedback and information to the user during command execution. 
 * Implementations of this interface should provide the logic for outputting messages in a way that is appropriate for the context of the CLI, such as writing to the console or a log file.
 */
export interface Display {

  /* Logs an error message, typically used to indicate a failure or issue that occurred during command execution. This method should be used to provide feedback to the user when something goes wrong, allowing them to understand what happened and potentially how to resolve it. */
  error(message: string): void;

  /* Logs an informational message, typically used to provide feedback about the progress or status of command execution. This method can be used to inform the user about what is happening during the execution of a command, such as when a badge is being generated or when a certain step is completed. */
  info(message: string): void;

  /* Logs a warning message, typically used to indicate a potential issue or something that the user should be aware of during command execution. This method can be used to provide feedback about non-critical issues or to suggest best practices without necessarily indicating a failure. */
  warn(message: string): void;

  /* Logs a trace message, typically used for detailed debugging information during command execution. This method can be used to provide in-depth insights into the internal workings of the command, such as variable values, execution flow, or other technical details that may be useful for troubleshooting or understanding the behavior of the CLI. */
  trace(message: string): void;

  /* Logs a dry run message, typically used to indicate that a command is being executed in a dry run mode where no actual changes are being made. This method can be used to provide feedback to the user about what would happen if the command were executed without the dry run flag, allowing them to see the potential effects of their actions without making any changes to their system or files. */
  dry(message: string): void;
}

/**
 * Flags interface representing the various options and settings that can be applied to commands within the badges-ts CLI. 
 * This interface defines boolean properties for different flags (dryRun, quiet, trace, warn, verbose) that can be used to modify the behavior of commands and control the level of output and logging during command execution. 
 * Implementations of this interface should provide the logic for parsing these flags from command-line arguments and applying their effects appropriately within the CLI.
 */
export interface Flags {

  /* Indicates whether the command should be executed in dry run mode, where no actual changes are made. */
  dryRun: boolean;

  /* Indicates whether the command should operate in quiet mode, suppressing most output. */
  quiet: boolean;

  /* Indicates whether trace-level logging should be enabled, providing detailed debugging information. */
  trace: boolean;

  /* Indicates whether warning messages should be logged, providing feedback about potential issues or non-critical problems during command execution. */
  warn: boolean;

  /* Indicates whether verbose logging should be enabled, providing more detailed output about the command execution process. This may include additional informational messages, warnings, and trace-level details to help the user understand what is happening during the execution of a command. */
  verbose: boolean;
}